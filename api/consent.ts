// api/consent.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

type Payload = {
  nombre: string;
  rutEmpresa: string;
  email: string;
  aceptaTerminos: boolean;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const body = typeof req.body === 'string' ? safeJSON(req.body) : req.body || {};
  const { nombre = '', rutEmpresa = '', email = '', aceptaTerminos = false } = body as Payload;

  if (!aceptaTerminos) {
    return res.status(400).json({ ok: false, error: 'Debe aceptar los términos.' });
  }
  if (!nombre.trim() || !rutEmpresa.trim() || !email.trim()) {
    return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios.' });
  }
  if (!validarEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Email inválido.' });
  }
  if (!validarRut(rutEmpresa)) {
    return res.status(400).json({ ok: false, error: 'RUT inválido.' });
  }

  const record = {
    nombre: nombre.trim(),
    rutEmpresa: normalizarRut(rutEmpresa.trim()),
    email: email.trim(),
    aceptaTerminos: true,
    acceptedAt: new Date().toISOString(),
    ip: getIp(req),
    userAgent: (req.headers['user-agent'] as string) || '',
  };

  try {
    const filename = `submissions/${Date.now()}.json`;

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('[consent] Falta BLOB_READ_WRITE_TOKEN');
      return res.status(500).json({ ok: false, error: 'Falta BLOB_READ_WRITE_TOKEN' });
    }
    
    const result = await put(filename, JSON.stringify(record), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: true,
    });
    return res.status(201).json({ ok: true, id: result.pathname });
  } catch (e: any){
    console.error('[consent] put() error:', e?.message || e);
    return res.status(500).json({ ok: false, error: e?.message || 'Fallo en put()' });
  }
}

/* ===== Helpers ===== */
function safeJSON(s?: string) {
  try {
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

function getIp(req: VercelRequest) {
  const xf = (req.headers['x-forwarded-for'] as string) || '';
  return xf.split(',')[0].trim() || (req.socket?.remoteAddress || '') || '';
}

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizarRut(rut: string) {
  return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
}

function dvRut(num: string) {
  let suma = 0,
    mul = 2;
  for (let i = num.length - 1; i >= 0; i--) {
    suma += parseInt(num[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (suma % 11);
  if (res === 11) return '0';
  if (res === 10) return 'K';
  return String(res);
}

function validarRut(rut: string) {
  const r = normalizarRut(rut);
  if (r.length < 2) return false;
  const cuerpo = r.slice(0, -1);
  const dv = r.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;
  return dvRut(cuerpo) === dv;
}
