import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './LandingPage.css'

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>UniButler</h2>
          </div>
          <div className="nav-links">
            {isLoggedIn ? (
              <>
                <button onClick={() => navigate('/dashboard')} className="nav-link nav-link--primary">
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link nav-link--primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Your Personal <span className="highlight">Study Assistant</span>
            </h1>
            <p className="hero-description">
              Track your tasks, monitor your mood, and boost your productivity with AI-powered insights. 
              UniButler helps you stay organized and motivated throughout your academic journey.
            </p>
            <div className="hero-actions">
              {isLoggedIn ? (
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="btn btn--primary btn--large"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <Link to="/register" className="btn btn--primary btn--large">
                    Start Your Journey
                  </Link>
                  <Link to="/login" className="btn btn--secondary btn--large">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-card">
              <div className="card-header">
                <div className="card-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="card-content">
                <div className="dashboard-preview">
                  <div className="preview-section">
                    <h3>Today's Tasks</h3>
                    <div className="task-item">
                      <div className="task-checkbox"></div>
                      <span>Complete Math Assignment</span>
                    </div>
                    <div className="task-item">
                      <div className="task-checkbox checked"></div>
                      <span>Review Chemistry Notes</span>
                    </div>
                  </div>
                  <div className="preview-section">
                    <h3>Mood Tracking</h3>
                    <div className="mood-indicators">
                      <div className="mood-item active">😊</div>
                      <div className="mood-item">😐</div>
                      <div className="mood-item">😔</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <h2 className="features-title">Everything You Need to Succeed</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Smart Task Management</h3>
              <p>Organize your assignments, set priorities, and track your progress with intelligent task categorization.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">😊</div>
              <h3>Mood Tracking</h3>
              <p>Monitor your emotional well-being and identify patterns that affect your productivity and study habits.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics & Insights</h3>
              <p>Get personalized insights and recommendations based on your study patterns and mood trends.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Goal Setting</h3>
              <p>Set academic goals and track your progress with detailed analytics and achievement milestones.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>Study Sessions</h3>
              <p>Track your study time and optimize your schedule based on your most productive hours.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Suggestions</h3>
              <p>Receive intelligent recommendations for study strategies and time management techniques.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Transform Your Study Experience?</h2>
          <p className="cta-description">
            Join thousands of students who are already using UniButler to stay organized, motivated, and successful.
          </p>
          <Link to="/register" className="btn btn--primary btn--large">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>UniButler</h3>
              <p>Your personal study assistant for academic success.</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#updates">Updates</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 UniButler. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
