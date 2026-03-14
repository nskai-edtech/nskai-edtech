import Link from "next/link";

const APP_HOME_LABEL = "ZERRA Home";

export function Logo() {
    return (
        <Link
            href="/"
            className="mb-8 flex items-center gap-2 font-black text-2xl text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
            aria-label={APP_HOME_LABEL}
        >
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white text-xl">
                Z
            </div>
            ZERRA
        </Link>
    );
}