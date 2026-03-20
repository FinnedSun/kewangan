import { Hono } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

const app = new Hono()
    .post(
        "/",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            try {
                const body = await c.req.parseBody();
                const file = body['receipt'];

                if (!file || typeof file === 'string') {
                    return c.json({ error: "File not provided or invalid" }, 400);
                }

                const arrayBuffer = await file.arrayBuffer();

                // Edge runtime compatible base64 encoding
                const uint8Array = new Uint8Array(arrayBuffer);
                const chunkSize = 8192;
                let stringContent = "";
                for (let i = 0; i < uint8Array.length; i += chunkSize) {
                    const chunk = Array.from(uint8Array.subarray(i, i + chunkSize));
                    stringContent += String.fromCharCode(...chunk);
                }
                const base64String = btoa(stringContent);
                const mimeType = file.type || 'image/jpeg';

                const provider = process.env.AI_PROVIDER || 'gemini';
                let text: string | null = null;

                if (provider === 'openai') {
                    const openai = new OpenAI({
                        apiKey: process.env.AI_API_KEY,
                        baseURL: process.env.AI_BASE_URL,
                    });

                    const response = await openai.chat.completions.create({
                        model: process.env.AI_MODEL || "gpt-4o-mini",
                        messages: [
                            {
                                role: "user",
                                content: [
                                    {
                                        type: "text",
                                        text: "Ekstrak informasi berikut dari gambar struk ini dan kembalikan hanya dalam format JSON. Keys yang dibutuhkan:\n- amount: (string) total nominal tanpa simbol mata uang atau pemisah ribuan. Berikan tanda minus (-) di depannya jika ini adalah struk pengeluaran/belanja (contoh: '-150000'). Jika ini adalah struk pemasukan/deposit, biarkan positif (contoh: '150000').\n- date: (string) tanggal transaksi dalam format YYYY-MM-DD. Jika tidak ada, gunakan tanggal hari ini.\n- payee: (string) nama toko atau merchant.\n- notes: (string) catatan singkat berisi item-item utama yang dibeli.\n- category: (string) tebak kategori pengeluaran yang paling relevan (misal: 'Belanja', 'Makanan', 'Transportasi').\n- account: (string) tebak metode pembayaran atau nama akun yang digunakan (misal: 'Cash', 'BCA', 'GoPay', dll). Akun tidak boleh 'tidak diketahui', jadi jika di struk akun benar-benar tidak ada, masukan/buat akun 'Dompet'."
                                    },
                                    {
                                        type: "image_url",
                                        image_url: {
                                            url: `data:${mimeType};base64,${base64String}`
                                        }
                                    }
                                ]
                            }
                        ]
                    });

                    const rawText = response.choices[0]?.message?.content || null;
                    // Clean markdown JSON wrapper if present (very common with alternative providers without response_format)
                    if (rawText) {
                        text = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
                    }
                } else {
                    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

                    const response = await ai.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents: [
                            {
                                parts: [
                                    { text: "Ekstrak informasi berikut dari gambar struk ini dan kembalikan hanya dalam format JSON. Keys yang dibutuhkan:\n- amount: (string) total nominal tanpa simbol mata uang atau pemisah ribuan. Berikan tanda minus (-) di depannya jika ini adalah struk pengeluaran/belanja (contoh: '-150000'). Jika ini adalah struk pemasukan/deposit, biarkan positif (contoh: '150000').\n- date: (string) tanggal transaksi dalam format YYYY-MM-DD. Jika tidak ada, gunakan tanggal hari ini.\n- payee: (string) nama toko atau merchant.\n- notes: (string) catatan singkat berisi item-item utama yang dibeli.\n- category: (string) tebak kategori pengeluaran yang paling relevan (misal: 'Belanja', 'Makanan', 'Transportasi').\n- account: (string) tebak metode pembayaran atau nama akun yang digunakan (misal: 'Cash', 'BCA', 'GoPay', dll). Akun tidak boleh 'tidak diketahui', jadi jika di struk akun benar-benar tidak ada, masukan/buat akun 'Cash'." },
                                    {
                                        inlineData: {
                                            data: base64String,
                                            mimeType: mimeType
                                        }
                                    }
                                ]
                            }
                        ],
                        config: {
                            responseMimeType: "application/json",
                        }
                    });

                    text = response.text || null;
                }
                if (!text) {
                    throw new Error("Empty response from AI");
                }

                const data = JSON.parse(text);

                return c.json({ data });
            } catch (error) {
                console.error("OCR Error:", error);
                return c.json({ error: "Gagal memproses struk" }, 500);
            }
        }
    );

export default app;
