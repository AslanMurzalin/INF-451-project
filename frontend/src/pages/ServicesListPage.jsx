import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import servicesService from '../services/services';
import feedbackService from '../services/feedback';
import { StarIcon } from '../assets/icons';
import './ServicesListPage.css';

export function ServicesListPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [servicesData, categoriesData, reviewsData] = await Promise.all([
          servicesService.getServices(1, 50),
          servicesService.getCategories(),
          feedbackService.getFeedbacks('SERVICE_REVIEW'),
        ]);

        setServices(servicesData?.items || []);
        setCategories(categoriesData || []);
        setRecentReviews(reviewsData || []);
      } catch (err) {
        console.error('Error loading services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleReview = (service) => {
    navigate(`/feedback?type=service&serviceId=${service.service_id}`);
  };

  const filteredServices = selectedCategory === 'ALL'
    ? services
    : services.filter(s => s.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="services-page-container">
      <div className="services-page-subtitle">
        CAMPUS FACILITIES & STUDENT SERVICES REVIEWS
      </div>

      {/* Category filter tabs */}
      <div className="services-category-tabs">
        <button
          type="button"
          className={`service-cat-tab ${selectedCategory === 'ALL' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('ALL')}
        >
          ALL SERVICES ({services.length})
        </button>
        {categories.map((cat, idx) => (
          <button
            key={idx}
            type="button"
            className={`service-cat-tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.toUpperCase()} ({services.filter(s => s.category?.toLowerCase() === cat.toLowerCase()).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="services-loading-state">Loading campus services...</div>
      ) : filteredServices.length === 0 ? (
        <div className="services-empty-state">No campus services found for this category.</div>
      ) : (
        <div className="services-grid">
          {filteredServices.map((service) => {
            const reviewsForThis = recentReviews.filter(
              r => r.targetId === Number(service.service_id) || r.targetTitle === service.name
            );
            const reviewCount = reviewsForThis.length;
            const avgRating = reviewCount > 0
              ? (reviewsForThis.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewCount).toFixed(1)
              : '5.0';

            return (
              <div key={service.service_id} className="service-card-box">
                <div className="service-card-top">
                  <span className="service-cat-badge">{service.category || 'SERVICE'}</span>
                  <div className="service-rating-display">
                    <StarIcon size={13} filled={true} color="#f59e0b" />
                    <span className="avg-rating-val">{avgRating}</span>
                    <span className="rating-count-val">({reviewCount} reviews)</span>
                  </div>
                </div>

                <h3 className="service-name">{service.name}</h3>
                <p className="service-desc">{service.description}</p>

                <div className="service-details-row">
                  {service.location && (
                    <div className="service-detail-item">
                      <span className="det-label">LOC:</span>
                      <span className="det-val">{service.location}</span>
                    </div>
                  )}
                  {service.contact_email && (
                    <div className="service-detail-item">
                      <span className="det-label">CONTACT:</span>
                      <span className="det-val">{service.contact_email}</span>
                    </div>
                  )}
                </div>

                <div className="service-card-footer">
                  <button
                    type="button"
                    className="leave-review-btn"
                    onClick={() => handleReview(service)}
                  >
                    LEAVE REVIEW ★
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ServicesListPage;
