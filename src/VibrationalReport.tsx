import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import 'bootstrap/dist/css/bootstrap.min.css';

interface VibrationalReportData {
  frequency: number;
  level: string;
  percentage: number;
  analysis: string;
  recommendations: string[];
  affirmation: string;
}

const VibrationalReport = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<VibrationalReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (currentUser) {
        try {
          const reportRef = doc(db, 'vibrationalReports', currentUser.uid);
          const reportSnap = await getDoc(reportRef);
          
          if (reportSnap.exists()) {
            setReportData(reportSnap.data() as VibrationalReportData);
          }
        } catch (error) {
          console.error('Error fetching vibrational report:', error);
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

  const getFrequencyColor = (frequency: number) => {
    if (frequency >= 600) return '#8b5cf6'; // Purple - Enlightened
    if (frequency >= 500) return '#10b981'; // Green - High vibration
    if (frequency >= 400) return '#f59e0b'; // Yellow - Positive
    if (frequency >= 300) return '#f97316'; // Orange - Neutral
    return '#ef4444'; // Red - Lower vibration
  };

  const getFrequencyDescription = (frequency: number) => {
    if (frequency >= 600) return 'Enlightened Consciousness';
    if (frequency >= 500) return 'High Vibrational State';
    if (frequency >= 400) return 'Positive Energy Flow';
    if (frequency >= 300) return 'Balanced Vibration';
    return 'Transformative Phase';
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Loading your vibrational report...</h4>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h4>No Vibrational Report Found</h4>
          <p>Please complete the Vibrational Frequency assessment first.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigateToPath('vibrational')}
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
          <div className="col-lg-10">
            {/* Header */}
            <div className="text-center text-white mb-5">
              <h1 className="display-4 fw-bold mb-3">Your Vibrational Frequency</h1>
              <p className="lead">Discover Your Energetic Signature</p>
            </div>

            {/* Main Frequency Card */}
            <div className="row mb-5">
              <div className="col-lg-6">
                <div className="card shadow-lg h-100">
                  <div className="card-header text-center py-4" style={{ 
                    background: getFrequencyColor(reportData.frequency),
                    color: 'white' 
                  }}>
                    <h3 className="mb-0">Your Frequency</h3>
                  </div>
                  <div className="card-body text-center py-5">
                    {/* Frequency Gauge */}
                    <div className="position-relative d-inline-block mb-4">
                      <svg width="200" height="120" viewBox="0 0 200 120">
                        <defs>
                          <linearGradient id="frequencyGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={getFrequencyColor(reportData.frequency)} />
                            <stop offset="100%" stopColor={getFrequencyColor(reportData.frequency)} />
                          </linearGradient>
                        </defs>
                        {/* Background Arc */}
                        <path
                          d="M 20 100 A 80 80 0 0 1 180 100"
                          stroke="#e0e0e0"
                          strokeWidth="15"
                          fill="none"
                        />
                        {/* Value Arc */}
                        <path
                          d="M 20 100 A 80 80 0 0 1 180 100"
                          stroke="url(#frequencyGradient)"
                          strokeWidth="15"
                          fill="none"
                          strokeDasharray={`${(reportData.frequency / 800) * 251.2}, 251.2`}
                          strokeLinecap="round"
                        />
                        {/* Center Text */}
                        <text x="100" y="85" fontSize="24" textAnchor="middle" fill="#333" fontWeight="bold">
                          {reportData.frequency}
                        </text>
                        <text x="100" y="105" fontSize="14" textAnchor="middle" fill="#666">
                          Hz
                        </text>
                      </svg>
                    </div>
                    
                    <h2 className="mb-3" style={{ color: getFrequencyColor(reportData.frequency) }}>
                      {reportData.level}
                    </h2>
                    <p className="text-muted mb-0">{getFrequencyDescription(reportData.frequency)}</p>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-6">
                <div className="card shadow-lg h-100">
                  <div className="card-header bg-primary text-white text-center py-4">
                    <h3 className="mb-0">Energy Percentage</h3>
                  </div>
                  <div className="card-body d-flex align-items-center justify-content-center">
                    <div className="text-center">
                      <div className="position-relative d-inline-block">
                        <svg width="150" height="150">
                          <circle
                            cx="75"
                            cy="75"
                            r="60"
                            fill="none"
                            stroke="#e0e0e0"
                            strokeWidth="12"
                          />
                          <circle
                            cx="75"
                            cy="75"
                            r="60"
                            fill="none"
                            stroke="#007bff"
                            strokeWidth="12"
                            strokeDasharray={`${(reportData.percentage / 100) * 377} 377`}
                            strokeLinecap="round"
                            transform="rotate(-90 75 75)"
                          />
                          <text x="75" y="85" fontSize="32" textAnchor="middle" fill="#333" fontWeight="bold">
                            {reportData.percentage}%
                          </text>
                        </svg>
                      </div>
                      <h4 className="mt-3 text-primary">Overall Energy</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Section */}
            <div className="card shadow-lg mb-5">
              <div className="card-header bg-dark text-white">
                <h3 className="mb-0">Your Vibrational Analysis</h3>
              </div>
              <div className="card-body">
                <div style={{ 
                  fontSize: '1.1rem', 
                  lineHeight: '1.8',
                  whiteSpace: 'pre-wrap' 
                }}>
                  {reportData.analysis}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="card shadow-lg mb-5">
              <div className="card-header bg-success text-white">
                <h3 className="mb-0">Recommendations to Raise Your Frequency</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {reportData.recommendations.map((rec, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              backgroundColor: getFrequencyColor(reportData.frequency),
                              color: 'white'
                            }}
                          >
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-semibold">{rec}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Affirmation */}
            <div className="card shadow-lg mb-5" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <div className="card-body text-center py-5">
                <h3 className="mb-4">Your Personal Affirmation</h3>
                <blockquote className="blockquote">
                  <p className="mb-0 fs-4 fst-italic">"{reportData.affirmation}"</p>
                </blockquote>
              </div>
            </div>

            {/* Cross-Navigation */}
            <div className="row g-4 mb-5">
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
              
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #9c88ff 0%, #8c7ae6 100%)' }}>
                  <div className="card-body text-center py-4">
                    <div className="mb-3">
                      <i className="bi bi-stars" style={{ fontSize: '3rem', color: '#fff' }}></i>
                    </div>
                    <h4 className="text-white mb-3">Discover Your Karma</h4>
                    <p className="text-white mb-4">Unveil your karmic patterns through Vedic astrology</p>
                    <button 
                      className="btn btn-light btn-lg"
                      onClick={() => navigateToPath('karmic')}
                    >
                      Get Karmic Reading
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <button 
                className="btn btn-primary btn-lg me-3"
                onClick={() => window.print()}
              >
                Download Report
              </button>
              <button 
                className="btn btn-outline-light btn-lg"
                onClick={() => navigate('/onboarding-one')}
              >
                Explore Other Paths
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibrationalReport;