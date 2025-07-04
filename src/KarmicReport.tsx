import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import 'bootstrap/dist/css/bootstrap.min.css';

interface KarmicReportData {
  birthPlace: string;
  lifeArea: string;
  challenge: string;
  jyotishReading: string;
  chartImages: {
    rasiChart: string;
    navamshaChart: string;
  };
  birthData: {
    location: string;
    dob: string;
    tob: string;
    timezone: string;
  };
}

const KarmicReport = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<KarmicReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (currentUser) {
        try {
          const reportRef = doc(db, 'karmicReports', currentUser.uid);
          const reportSnap = await getDoc(reportRef);
          
          if (reportSnap.exists()) {
            setReportData(reportSnap.data() as KarmicReportData);
          }
        } catch (error) {
          console.error('Error fetching karmic report:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReport();
  }, [currentUser]);

  const navigateToPath = (path: string) => {
    navigate(`/chat?path=${path}`);
  };

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="text-center text-white">
          <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Consulting the cosmic energies...</h4>
          <p>Your Jyotish reading is being prepared</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h4>No Karmic Report Found</h4>
          <p>Please complete the Karmic Awareness assessment first.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigateToPath('karmic')}
          >
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            {/* Header */}
            <div className="text-center text-white mb-5">
              <h1 className="display-4 fw-bold mb-3">Your Jyotish Reading</h1>
              <p className="lead">Karmic Awareness & Cosmic Insights</p>
              
              {/* Birth Details Summary */}
              <div className="row justify-content-center mt-4">
                <div className="col-lg-8">
                  <div className="card bg-white bg-opacity-10 backdrop-blur border-0">
                    <div className="card-body">
                      <div className="row text-white">
                        <div className="col-md-3 mb-3 mb-md-0">
                          <div className="fw-bold">Birth Date</div>
                          <div className="small opacity-75">{formatDate(reportData.birthData.dob)}</div>
                        </div>
                        <div className="col-md-3 mb-3 mb-md-0">
                          <div className="fw-bold">Birth Time</div>
                          <div className="small opacity-75">{formatTime(reportData.birthData.tob)}</div>
                        </div>
                        <div className="col-md-3 mb-3 mb-md-0">
                          <div className="fw-bold">Birth Place</div>
                          <div className="small opacity-75">{reportData.birthPlace}</div>
                        </div>
                        <div className="col-md-3">
                          <div className="fw-bold">Focus Area</div>
                          <div className="small opacity-75">{reportData.lifeArea}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Images */}
            {reportData.chartImages && (
              <div className="row mb-5">
                <div className="col-lg-6 mb-4">
                  <div className="card shadow-lg h-100">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0 d-flex align-items-center">
                        <i className="bi bi-diagram-3 me-2"></i>
                        Rasi Chart (D1) - Birth Chart
                      </h5>
                    </div>
                    <div className="card-body text-center p-4">
                      <div className="position-relative">
                        <img 
                          src={reportData.chartImages.rasiChart} 
                          alt="Rasi Chart"
                          className="img-fluid rounded"
                          style={{ maxHeight: '300px', border: '2px solid #dee2e6' }}
                        />
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge bg-primary">D1</span>
                        </div>
                      </div>
                      <p className="text-muted mt-3 mb-0">
                        Shows planetary positions at time of birth
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 mb-4">
                  <div className="card shadow-lg h-100">
                    <div className="card-header bg-success text-white">
                      <h5 className="mb-0 d-flex align-items-center">
                        <i className="bi bi-diagram-2 me-2"></i>
                        Navamsha Chart (D9) - Soul Chart
                      </h5>
                    </div>
                    <div className="card-body text-center p-4">
                      <div className="position-relative">
                        <img 
                          src={reportData.chartImages.navamshaChart} 
                          alt="Navamsha Chart"
                          className="img-fluid rounded"
                          style={{ maxHeight: '300px', border: '2px solid #dee2e6' }}
                        />
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge bg-success">D9</span>
                        </div>
                      </div>
                      <p className="text-muted mt-3 mb-0">
                        Reveals deeper spiritual nature and marriage
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Jyotish Reading */}
            <div className="card shadow-lg mb-5">
              <div className="card-header bg-dark text-white">
                <h3 className="mb-0 d-flex align-items-center">
                  <i className="bi bi-stars me-2"></i>
                  Your Personalized Jyotish Reading
                </h3>
              </div>
              <div className="card-body">
                <div style={{ 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: '1.8',
                  fontSize: '1.1rem'
                }}>
                  {reportData.jyotishReading}
                </div>
              </div>
            </div>

            {/* User Responses Summary */}
            <div className="row mb-5">
              <div className="col-md-4">
                <div className="card shadow h-100">
                  <div className="card-header bg-info text-white">
                    <h6 className="mb-0 d-flex align-items-center">
                      <i className="bi bi-geo-alt me-2"></i>
                      Birth Place Confirmed
                    </h6>
                  </div>
                  <div className="card-body">
                    <p className="mb-0 fw-semibold">{reportData.birthPlace}</p>
                    <small className="text-muted">Location used for chart calculation</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow h-100">
                  <div className="card-header bg-warning text-dark">
                    <h6 className="mb-0 d-flex align-items-center">
                      <i className="bi bi-heart me-2"></i>
                      Area of Focus
                    </h6>
                  </div>
                  <div className="card-body">
                    <p className="mb-0 fw-semibold">{reportData.lifeArea}</p>
                    <small className="text-muted">Your current area of curiosity</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow h-100">
                  <div className="card-header bg-danger text-white">
                    <h6 className="mb-0 d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Current Challenge
                    </h6>
                  </div>
                  <div className="card-body">
                    <p className="mb-0 fw-semibold">{reportData.challenge}</p>
                    <small className="text-muted">Karmic pattern for growth</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Cross-Navigation */}
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="card-body text-center py-4">
                    <div className="mb-3">
                      <i className="bi bi-activity" style={{ fontSize: '3rem', color: '#fff' }}></i>
                    </div>
                    <h4 className="text-white mb-3">Check Your Vibration</h4>
                    <p className="text-white mb-4">Discover your current vibrational frequency and energy level</p>
                    <button 
                      className="btn btn-light btn-lg"
                      onClick={() => navigateToPath('vibrational')}
                    >
                      Measure Frequency
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' }}>
                  <div className="card-body text-center py-4">
                    <div className="mb-3">
                      <i className="bi bi-palette" style={{ fontSize: '3rem', color: '#fff' }}></i>
                    </div>
                    <h4 className="text-white mb-3">Explore Your Aura</h4>
                    <p className="text-white mb-4">Discover the colors and energies that surround your spirit</p>
                    <button 
                      className="btn btn-light btn-lg"
                      onClick={() => navigateToPath('aura')}
                    >
                      Reveal My Aura
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cosmic Insight Box */}
            <div className="card shadow-lg mb-5" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div className="card-body text-center py-5 text-white">
                <div className="mb-4">
                  <i className="bi bi-stars" style={{ fontSize: '4rem', opacity: 0.8 }}></i>
                </div>
                <h3 className="mb-4">Cosmic Wisdom</h3>
                <blockquote className="blockquote">
                  <p className="mb-0 fs-5 fst-italic">
                    "The stars impel, they do not compel. Your free will shapes your destiny, 
                    while the cosmic energies provide the backdrop for your soul's evolution."
                  </p>
                </blockquote>
                <footer className="blockquote-footer mt-3">
                  <cite title="Source Title">Ancient Vedic Wisdom</cite>
                </footer>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <button 
                className="btn btn-primary btn-lg me-3"
                onClick={() => window.print()}
              >
                <i className="bi bi-download me-2"></i>
                Download Reading
              </button>
              <button 
                className="btn btn-outline-light btn-lg me-3"
                onClick={() => navigate('/onboarding-one')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Explore Other Paths
              </button>
              <button 
                className="btn btn-success btn-lg"
                onClick={() => window.location.href = `mailto:?subject=My Jyotish Reading&body=Check out my personalized Jyotish reading from Eternal AI!`}
              >
                <i className="bi bi-share me-2"></i>
                Share Reading
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KarmicReport;