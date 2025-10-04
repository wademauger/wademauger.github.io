import React from 'react';

type State = { hasError: boolean; error: any };

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // Log to console so devtools capture it
    console.error('ErrorBoundary caught error', error, info);
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error;
      return (
        <div style={{ padding: 24 }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff6f6', padding: 12, borderRadius: 6 }}>{String(err && (err.stack || err.message || err))}</pre>
        </div>
      );
    }

    return this.props.children as any;
  }
}

export default ErrorBoundary;
