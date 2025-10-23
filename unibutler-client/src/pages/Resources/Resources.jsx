import { useEffect, useState } from "react";
import "./Resources.css";
import { api, ApiError } from "../../shared/api";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    search: "",
    difficulty: "",
    targetAudience: "",
    isFree: null
  });
  const [selectedResource, setSelectedResource] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [registrationLoading, setRegistrationLoading] = useState({});
  
  // Debug function to track selectedResource changes
  useEffect(() => {
    console.log("selectedResource changed:", selectedResource?.title || "null");
  }, [selectedResource]);
  
  // Debug function to track navigation
  useEffect(() => {
    console.log("Current location:", window.location.pathname);
  }, []);
  
  // Debug function to track navigation changes
  useEffect(() => {
    const handleLocationChange = () => {
      console.log("Location changed to:", window.location.pathname);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  async function loadResources() {
    try {
      setLoading(true);
      setError("");

      console.log("Loading resources with filters:", filters);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.targetAudience) params.append('targetAudience', filters.targetAudience);
      if (filters.isFree !== null) params.append('isFree', filters.isFree);

      const response = await api(`/resources?${params.toString()}`);
      setResources(response.resources || []);

    } catch (e) {
      console.error("Error loading resources:", e);
      setError(e.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const response = await api("/resources/categories");
      setCategories(response.categories || []);
    } catch (e) {
      console.warn("Failed to load categories:", e);
    }
  }

  async function loadTypes() {
    try {
      const response = await api("/resources/types");
      setTypes(response.types || []);
    } catch (e) {
      console.warn("Failed to load types:", e);
    }
  }

  useEffect(() => {
    console.log("useEffect triggered with filters:", filters);
    loadResources();
    loadCategories();
    loadTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (key, value) => {
    console.log("Filter changed:", key, value);
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    console.log("Clearing filters");
    setFilters({
      category: "",
      type: "",
      search: "",
      difficulty: "",
      targetAudience: "",
      isFree: null
    });
  };

  async function handleRegistration(resourceId) {
    try {
      setRegistrationLoading(prev => ({ ...prev, [resourceId]: true }));

      await api(`/resources/${resourceId}/register`, {
        method: 'POST'
      });

      setRegistrationStatus(prev => ({ ...prev, [resourceId]: true }));

      // Refresh the selected resource to show updated status
      if (selectedResource && selectedResource.id === resourceId) {
        setSelectedResource(prev => ({ ...prev, isRegistered: true }));
      }

      alert('Successfully registered for the resource!');

    } catch (e) {
      console.error("Registration failed:", e);
      alert(e.message || 'Failed to register for the resource');
    } finally {
      setRegistrationLoading(prev => ({ ...prev, [resourceId]: false }));
    }
  }

  async function handleCancelRegistration(resourceId) {
    try {
      setRegistrationLoading(prev => ({ ...prev, [resourceId]: true }));

      await api(`/resources/${resourceId}/register`, {
        method: 'DELETE'
      });

      setRegistrationStatus(prev => ({ ...prev, [resourceId]: false }));

      // Refresh the selected resource to show updated status
      if (selectedResource && selectedResource.id === resourceId) {
        setSelectedResource(prev => ({ ...prev, isRegistered: false }));
      }

      alert('Registration cancelled successfully!');

    } catch (e) {
      console.error("Cancel registration failed:", e);
      alert(e.message || 'Failed to cancel registration');
    } finally {
      setRegistrationLoading(prev => ({ ...prev, [resourceId]: false }));
    }
  }



  const formatDateTime = (dateTime) => {
    if (!dateTime) return "Ongoing";
    return new Date(dateTime).toLocaleString();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      workshop: "🎓",
      counseling: "💬",
      career: "💼",
      study: "📚",
      wellness: "🧘"
    };
    return icons[category] || "📋";
  };

  const getTypeIcon = (type) => {
    const icons = {
      event: "📅",
      service: "🛠️",
      tool: "🔧",
      article: "📄"
    };
    return icons[type] || "📋";
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: "#10b981",
      intermediate: "#f59e0b",
      advanced: "#ef4444"
    };
    return colors[difficulty] || "#6b7280";
  };

  return (
    <div className="resources">
      <div className="resources__header">
        <h1 className="resources__title">Resource Navigator</h1>
        <p className="resources__subtitle">
          Discover workshops, counseling services, career events, and study resources
        </p>
      </div>

      {error && (
        <div className="resources__error">
          {error}
        </div>
      )}

      {/* Filters */}
      <form className="resources__filters" onSubmit={(e) => e.preventDefault()}>
        <div className="filters__row">
          <div className="filter__group">
            <label className="filter__label">Search</label>
            <input
              type="text"
              className="filter__input"
              placeholder="Search resources..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          
          <div className="filter__group">
            <label className="filter__label">Category</label>
            <select
              className="filter__select"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter__group">
            <label className="filter__label">Type</label>
            <select
              className="filter__select"
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>
                  {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filters__row">
          <div className="filter__group">
            <label className="filter__label">Difficulty</label>
            <select
              className="filter__select"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="filter__group">
            <label className="filter__label">Target Audience</label>
            <select
              className="filter__select"
              value={filters.targetAudience}
              onChange={(e) => handleFilterChange("targetAudience", e.target.value)}
            >
              <option value="">All Audiences</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="all">All Students</option>
            </select>
          </div>

          <div className="filter__group">
            <label className="filter__label">Price</label>
            <select
              className="filter__select"
              value={filters.isFree === null ? "" : filters.isFree ? "free" : "paid"}
              onChange={(e) => {
                const value = e.target.value === "" ? null : e.target.value === "free";
                handleFilterChange("isFree", value);
              }}
            >
              <option value="">All Prices</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid Only</option>
            </select>
          </div>

          <button 
            type="button"
            className="filter__clear" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clearFilters();
            }}
          >
            Clear Filters
          </button>
        </div>
      </form>

      {/* Resources Grid */}
      <div className="resources__content">
        {loading ? (
          <div className="resources__loading">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="resources__empty">
            <h3>No resources found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="resources__grid">
            {resources.map(resource => (
              <div 
                key={resource.id} 
                className="resource__card"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className="resource__header">
                  <div className="resource__category">
                    {getCategoryIcon(resource.category)} {resource.category}
                  </div>
                  <div className="resource__type">
                    {getTypeIcon(resource.type)} {resource.type}
                  </div>
                </div>
                
                <h3 className="resource__title">{resource.title}</h3>
                <p className="resource__description">{resource.description}</p>
                
                <div className="resource__details">
                  <div className="resource__detail">
                    <span className="detail__label">📍 Location:</span>
                    <span className="detail__value">{resource.location}</span>
                  </div>
                  
                  {resource.startTime && (
                    <div className="resource__detail">
                      <span className="detail__label">🕒 Time:</span>
                      <span className="detail__value">{formatDateTime(resource.startTime)}</span>
                    </div>
                  )}
                  
                  <div className="resource__detail">
                    <span className="detail__label">👥 Organizer:</span>
                    <span className="detail__value">{resource.organizer}</span>
                  </div>
                  
                  <div className="resource__detail">
                    <span className="detail__label">💰 Price:</span>
                    <span className="detail__value">
                      {resource.isFree ? "Free" : `$${resource.price}`}
                    </span>
                  </div>
                </div>
                
                <div className="resource__tags">
                  {resource.tags?.map(tag => (
                    <span key={tag} className="resource__tag">#{tag}</span>
                  ))}
                </div>
                
                <div className="resource__footer">
                  <div className="resource__difficulty">
                    <span 
                      className="difficulty__badge"
                      style={{ backgroundColor: getDifficultyColor(resource.difficulty) }}
                    >
                      {resource.difficulty}
                    </span>
                  </div>
                  
                  <button 
                    type="button"
                    className="resource__button"
                    onClick={(e) => {
                      console.log("Button clicked for resource:", resource.title);
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Setting selected resource:", resource.title);
                      setSelectedResource(resource);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div className="modal__overlay" onClick={() => setSelectedResource(null)}>
          <div className="modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{selectedResource.title}</h2>
              <button 
                type="button"
                className="modal__close"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedResource(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal__body">
              <div className="modal__section">
                <h3>Description</h3>
                <p>{selectedResource.description}</p>
              </div>
              
              <div className="modal__section">
                <h3>Details</h3>
                <div className="modal__details">
                  <div className="modal__detail">
                    <strong>Category:</strong> {selectedResource.category}
                  </div>
                  <div className="modal__detail">
                    <strong>Type:</strong> {selectedResource.type}
                  </div>
                  <div className="modal__detail">
                    <strong>Location:</strong> {selectedResource.location}
                  </div>
                  <div className="modal__detail">
                    <strong>Organizer:</strong> {selectedResource.organizer}
                  </div>
                  {selectedResource.startTime && (
                    <div className="modal__detail">
                      <strong>Start Time:</strong> {formatDateTime(selectedResource.startTime)}
                    </div>
                  )}
                  {selectedResource.endTime && (
                    <div className="modal__detail">
                      <strong>End Time:</strong> {formatDateTime(selectedResource.endTime)}
                    </div>
                  )}
                  <div className="modal__detail">
                    <strong>Price:</strong> {selectedResource.isFree ? "Free" : `$${selectedResource.price}`}
                  </div>
                  <div className="modal__detail">
                    <strong>Difficulty:</strong> {selectedResource.difficulty}
                  </div>
                  <div className="modal__detail">
                    <strong>Target Audience:</strong> {selectedResource.targetAudience}
                  </div>
                  {selectedResource.maxParticipants > 0 && (
                    <div className="modal__detail">
                      <strong>Available Spots:</strong> {selectedResource.maxParticipants - selectedResource.currentParticipants}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedResource.tags && selectedResource.tags.length > 0 && (
                <div className="modal__section">
                  <h3>Tags</h3>
                  <div className="modal__tags">
                    {selectedResource.tags.map(tag => (
                      <span key={tag} className="modal__tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal__footer">
              <button 
                type="button"
                className="modal__button modal__button--secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedResource(null);
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="modal__button modal__button--primary"
                disabled={registrationLoading[selectedResource.id]}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (registrationStatus[selectedResource.id]) {
                    handleCancelRegistration(selectedResource.id);
                  } else {
                    handleRegistration(selectedResource.id);
                  }
                }}
              >
                {registrationLoading[selectedResource.id] ? 'Processing...' :
                 registrationStatus[selectedResource.id] ? 'Cancel Registration' : 'Register'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
