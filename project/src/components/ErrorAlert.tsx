import { AlertIcon } from "./icons";

type ErrorAlertProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="flex animate-fade-up flex-col gap-3 rounded-2xl border border-rose-400/40 bg-rose-400/10 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
        <p className="text-sm leading-[1.5] text-rose-100">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-lg border border-rose-300/50 px-3 py-1.5 text-sm font-medium text-rose-100 transition-colors hover:bg-rose-400/20 focus-visible:outline-2 focus-visible:outline-rose-300"
        >
          Try again
        </button>
      )}
    </div>
  );
}
