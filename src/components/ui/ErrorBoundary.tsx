import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-charcoal text-text-primary p-8 flex flex-col items-center justify-center text-center">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong</h1>
                    <p className="text-text-muted mb-6 max-w-md">
                        The application crashed. This is often due to missing environment variables or a configuration issue.
                    </p>
                    {this.state.error && (
                        <div className="bg-surface p-4 rounded-lg border border-border text-left overflow-auto max-w-2xl w-full">
                            <pre className="text-red-400 text-sm font-mono whitespace-pre-wrap">
                                {this.state.error.message}
                            </pre>
                        </div>
                    )}
                    <button
                        className="mt-8 bg-primary text-charcoal font-bold py-2 px-6 rounded-lg hover:bg-primary-hover transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
