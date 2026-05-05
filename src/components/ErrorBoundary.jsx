import { Component } from "react";

/**
 * Catches render errors in lazy-loaded sections so a single failure
 * doesn't leave the user with a perpetual loading spinner.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Section render error:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="w-full min-h-[40vh] flex flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <p className="text-white/80 text-sm">
            This section failed to load.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-lg border border-white/15 text-white/85 text-sm hover:bg-white/5 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
