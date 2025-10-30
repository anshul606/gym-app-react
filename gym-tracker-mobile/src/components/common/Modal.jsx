import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import { trapFocus, focusFirstElement } from "../../utils/accessibility";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  closeOnOverlayClick = true,
  size = "medium",
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {

      previousActiveElement.current = document.activeElement;

      setTimeout(() => {
        focusFirstElement(modalRef.current);
      }, 100);

      const cleanup = trapFocus(modalRef.current);

      return () => {
        cleanup();

        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    small: "max-w-[280px] sm:max-w-sm",
    medium: "max-w-[340px] sm:max-w-md",
    large: "max-w-[400px] sm:max-w-lg md:max-w-2xl",
    full: "max-w-[90vw] sm:max-w-2xl md:max-w-4xl",
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50 backdrop-blur-sm pb-20 sm:pb-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={`
          ${sizeStyles[size]} w-full
          bg-[var(--bg-primary)] rounded-lg shadow-[var(--shadow-lg)]
          border border-[var(--border-primary)]
          max-h-[70vh] sm:max-h-[80vh] overflow-y-auto
          animate-fadeIn
        `}
      >
        {}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--border-primary)]">
            {title && (
              <h2
                id="modal-title"
                className="text-base sm:text-lg md:text-xl font-semibold text-[var(--text-primary)]"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-lg hover:bg-[var(--bg-secondary)]"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
        )}

        {}
        <div className="p-3 sm:p-4">{children}</div>

        {}
        {footer && (
          <div className="flex items-center justify-end gap-2 p-3 sm:p-4 border-t border-[var(--border-primary)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium", "large", "full"]),
};

export default Modal;
