/**
 * Lazy Groq client singleton.
 *
 * The Groq constructor throws if GROQ_API_KEY is absent, so we must NOT
 * instantiate it at module load time (which happens during `next build`).
 * Call getGroq() inside request handlers / async functions instead.
 */
import Groq from "groq-sdk";

let _groq: Groq | null = null;

export function getGroq(): Groq {
    if (!_groq) {
        _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return _groq;
}
