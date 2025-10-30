import { useState } from "react";
import PropTypes from "prop-types";
import Button from "../common/Button";
import Modal from "../common/Modal";

const WorkoutPlanCard = ({ plan, onStart, onEdit, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const exerciseCount = plan.exercises?.length || 0;

  const formatLastCompleted = (date) => {
    if (!date) return "Never completed";

    const lastCompleted = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - lastCompleted);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Completed today";
    if (diffDays === 1) return "Completed yesterday";
    if (diffDays < 7) return `Completed ${diffDays} days ago`;
    if (diffDays < 30) return `Completed ${Math.floor(diffDays / 7)} weeks ago`;
    return `Completed ${Math.floor(diffDays / 30)} months ago`;
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(plan.id);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="card p-4 hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
        {}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">
              {plan.name}
            </h3>
            {plan.description && (
              <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                {plan.description}
              </p>
            )}
          </div>
        </div>

        {}
        <div className="flex items-center gap-4 mb-4 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <span>
              {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="truncate">
              {formatLastCompleted(plan.lastCompleted)}
            </span>
          </div>
        </div>

        {}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="primary"
            onClick={() => onStart(plan.id)}
            fullWidth
            className="flex-1"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Start Workout
            </span>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => onEdit(plan.id)}
              className="flex-1 sm:flex-none"
            >
              <span className="flex items-center justify-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </span>
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteClick}
              className="flex-1 sm:flex-none"
            >
              <span className="flex items-center justify-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete
              </span>
            </Button>
          </div>
        </div>
      </div>

      {}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        title="Delete Workout Plan"
        size="small"
        footer={
          <>
            <Button variant="secondary" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-[var(--text-secondary)]">
          Are you sure you want to delete{" "}
          <strong className="text-[var(--text-primary)]">{plan.name}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

WorkoutPlanCard.propTypes = {
  plan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    exercises: PropTypes.array,
    lastCompleted: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.string,
    ]),
  }).isRequired,
  onStart: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default WorkoutPlanCard;
