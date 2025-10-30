import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWorkoutPlans } from "../hooks/useWorkoutPlans";
import useSwipeGesture from "../hooks/useSwipeGesture";
import WorkoutPlanCard from "../components/workout/WorkoutPlanCard";
import WorkoutPlanForm from "../components/workout/WorkoutPlanForm";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Modal from "../components/common/Modal";

const WorkoutPlans = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    workoutPlans,
    loading,
    error,
    deletePlan,
    createPlan,
    updatePlan,
    operationLoading,
  } = useWorkoutPlans();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const pages = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/workout-plans", name: "Workout Plans" },
    { path: "/progress", name: "Progress" },
    { path: "/profile", name: "Profile" },
  ];
  const currentPageIndex = 1;

  const handleSwipeLeft = () => {
    if (currentPageIndex < pages.length - 1) {
      navigate(pages[currentPageIndex + 1].path);
    }
  };

  const handleSwipeRight = () => {
    if (currentPageIndex > 0) {
      navigate(pages[currentPageIndex - 1].path);
    }
  };

  const { ref: swipeRef } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minSwipeDistance: 75,
    maxSwipeTime: 400,
  });

  const filteredPlans = useMemo(() => {
    let filtered = [...workoutPlans];

    if (filterActive === "active") {
      filtered = filtered.filter((plan) => plan.isActive !== false);
    } else if (filterActive === "inactive") {
      filtered = filtered.filter((plan) => plan.isActive === false);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(query) ||
          plan.description?.toLowerCase().includes(query) ||
          plan.exercises?.some((exercise) =>
            exercise.name.toLowerCase().includes(query)
          )
      );
    }

    return filtered;
  }, [workoutPlans, searchQuery, filterActive]);

  useEffect(() => {
    const shouldCreate = searchParams.get("create") === "true";
    const editPlanId = searchParams.get("edit");

    if (editPlanId) {
      const planToEdit = workoutPlans.find((p) => p.id === editPlanId);
      if (planToEdit) {
        setEditingPlan(planToEdit);
        setShowCreateForm(true);
      }
    } else if (shouldCreate) {
      setEditingPlan(null);
      setShowCreateForm(true);
    } else {
      setShowCreateForm(false);
      setEditingPlan(null);
    }
  }, [searchParams, workoutPlans]);

  const handleCreatePlan = () => {
    setSearchParams({ create: "true" });
    setShowCreateForm(true);
  };

  const handleCloseForm = () => {
    setSearchParams({});
    setShowCreateForm(false);
  };

  const handleStartWorkout = (planId) => {
    navigate(`/active-workout?planId=${planId}`);
  };

  const handleEditPlan = (planId) => {
    setSearchParams({ edit: planId });
    setShowCreateForm(true);
  };

  const handleDeletePlan = async (planId) => {
    try {
      await deletePlan(planId);
    } catch (err) {
      console.error("Failed to delete plan:", err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 mb-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
        <svg
          className="w-12 h-12 text-[var(--text-secondary)]"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
        No Workout Plans Yet
      </h3>
      <p className="text-[var(--text-secondary)] text-center mb-6 max-w-md">
        Get started by creating your first workout plan. Add exercises, set your
        goals, and track your progress.
      </p>
      <Button variant="primary" onClick={handleCreatePlan}>
        <span className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 4v16m8-8H4"></path>
          </svg>
          Create Your First Plan
        </span>
      </Button>
    </div>
  );

  const NoResultsState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 mb-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
        <svg
          className="w-12 h-12 text-[var(--text-secondary)]"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
        No Plans Found
      </h3>
      <p className="text-[var(--text-secondary)] text-center mb-6 max-w-md">
        No workout plans match your search criteria. Try adjusting your filters
        or search terms.
      </p>
      <Button variant="secondary" onClick={handleClearSearch}>
        Clear Search
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] safe-area-bottom">
      <div
        ref={swipeRef}
        className="container mx-auto px-4 py-8 pb-40 max-w-7xl container-safe"
      >
        {}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Workout Plans
            </h1>
            <Button variant="primary" onClick={handleCreatePlan}>
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 4v16m8-8H4"></path>
                </svg>
                <span className="hidden sm:inline">Create Plan</span>
                <span className="sm:hidden">Create</span>
              </span>
            </Button>
          </div>
          <p className="text-[var(--text-secondary)]">
            {workoutPlans.length} {workoutPlans.length === 1 ? "plan" : "plans"}{" "}
            total
          </p>
        </div>

        {}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {}
        {workoutPlans.length > 0 && (
          <div className="mb-6 space-y-4">
            {}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-[var(--text-secondary)]"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search plans by name, description, or exercise..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  aria-label="Clear search"
                >
                  <svg
                    className="w-5 h-5"
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

            {}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterActive("all")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors touch-manipulation touch-active min-h-[44px] ${
                  filterActive === "all"
                    ? "bg-[var(--accent-primary)] text-[var(--bg-primary)]"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                }`}
              >
                All Plans
              </button>
              <button
                onClick={() => setFilterActive("active")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors touch-manipulation touch-active min-h-[44px] ${
                  filterActive === "active"
                    ? "bg-[var(--accent-primary)] text-[var(--bg-primary)]"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterActive("inactive")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors touch-manipulation touch-active min-h-[44px] ${
                  filterActive === "inactive"
                    ? "bg-[var(--accent-primary)] text-[var(--bg-primary)]"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                }`}
              >
                Inactive
              </button>
            </div>

            {}
            {searchQuery && (
              <p className="text-sm text-[var(--text-secondary)]">
                Found {filteredPlans.length}{" "}
                {filteredPlans.length === 1 ? "plan" : "plans"}
              </p>
            )}
          </div>
        )}

        {}
        {workoutPlans.length === 0 ? (
          <EmptyState />
        ) : filteredPlans.length === 0 ? (
          <NoResultsState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <WorkoutPlanCard
                key={plan.id}
                plan={plan}
                onStart={handleStartWorkout}
                onEdit={handleEditPlan}
                onDelete={handleDeletePlan}
              />
            ))}
          </div>
        )}

        {}
        {operationLoading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-[var(--bg-primary)] rounded-lg p-6 shadow-xl">
              <LoadingSpinner size="large" />
            </div>
          </div>
        )}
      </div>

      {}
      <Modal
        isOpen={showCreateForm}
        onClose={handleCloseForm}
        title={editingPlan ? "Edit Workout Plan" : "Create Workout Plan"}
        size="large"
      >
        <WorkoutPlanForm
          plan={editingPlan}
          onSave={async (planData) => {
            try {
              if (editingPlan) {

                await updatePlan(editingPlan.id, planData);
              } else {

                await createPlan(planData);
              }
              handleCloseForm();
            } catch (err) {
              console.error(
                `Failed to ${editingPlan ? "update" : "create"} plan:`,
                err
              );
            }
          }}
          onCancel={handleCloseForm}
          isLoading={operationLoading}
        />
      </Modal>
    </div>
  );
};

export default WorkoutPlans;
