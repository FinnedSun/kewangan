/**
 * File ini merupakan konfigurasi utama API routes menggunakan Hono framework
 * yang dijalankan di Vercel Edge Runtime
 */

import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import summary from "./summary";
import accounts from './accounts';
import categories from './categories';
import transactions from './transactions';


/**
 * Mengatur runtime ke edge untuk performa yang lebih baik
 */
export const runtime = 'edge';

/**
 * Inisialisasi aplikasi Hono dengan base path '/api'
 */
const app = new Hono().basePath('/api')

/**
 * Konfigurasi routes utama:
 * - /api/summary: Endpoint untuk mendapatkan ringkasan data
 * - /api/accounts: Endpoint untuk manajemen akun
 * - /api/categories: Endpoint untuk manajemen kategori
 * - /api/transactions: Endpoint untuk manajemen transaksi
 */
const routes = app
  .route("/summary", summary)
  .route("/accounts", accounts)
  .route("/categories", categories)
  .route("/transactions", transactions)

/**
 * Export HTTP method handlers untuk Vercel
 * Mendukung operasi GET, POST, PATCH, dan DELETE
 */
export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

/**
 * Export tipe aplikasi untuk type safety
 */
export type AppType = typeof routes