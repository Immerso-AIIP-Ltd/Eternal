import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import 'bootstrap/dist/css/bootstrap.min.css';

interface AuraReportData {
  primaryColor: string;
  secondaryColors: string[];
  auraScore: number;
  personalityTraits: string;
  emotionalEnergy: string;
  strengths: string;
  areasForGrowth: string;
  affirmation: string;
  colorMeanings: {
    primary: string;
    secondary: string;
  };
}

const AuraReport = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<AuraReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (currentUser) {
        try {
          const reportRef = doc(db, 'auraReports', currentUser.uid);
          const reportSnap = await getDoc(reportRef);
          
          if (reportSnap.exists()) {
            setReportData(reportSnap.data() as AuraReportData);
          }
        } catch (error) {
          console.error('Error fetching aura report:', error);
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

  const getColorHex = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Red': '#dc3545',
      'Orange': '#fd7e14',
      'Yellow': '#ffc107',
      'Green': '#198754',
      'Blue': '#0d6efd',
      'Indigo': '#6610f2',
      'Violet': '#6f42c1',
      'Purple': '#6f42c1',
      'White': '#f8f9fa',
      'Gold': '#ffd700',
      'Pink': '#e91e63',
      'Turquoise': '#17a2b8',
      'Silver': '#6c757d'
    };
    return colorMap[colorName] || '#6c757d';
  };

  const renderAuraVisualization = () => {
    if (!reportData) return null;

    const primaryColor = getColorHex(reportData.primaryColor);
    const secondaryColor1 = reportData.secondaryColors[0] ? getColorHex(reportData.secondaryColors[0]) : primaryColor;
    const secondaryColor2 = reportData.secondaryColors[1] ? getColorHex(reportData.secondaryColors[1]) : secondaryColor1;

    return (
      <div className="position-relative d-flex justify-content-center mb-4">
        <svg width="300" height="300" viewBox="0 0 300 300">
          <defs>
            <radialGradient id="auraGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.9" />
              <stop offset="40%" stopColor={secondaryColor1} stopOpacity="0.6" />
              <stop offset="80%" stopColor={secondaryColor2} stopOpacity="0.3" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.1" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Outer aura rings */}
          <circle cx="150" cy="150" r="140" fill="none" stroke={secondaryColor2} strokeWidth="2" opacity="0.3" />
          <circle cx="150" cy="150" r="120" fill="none" stroke={secondaryColor1} strokeWidth="3" opacity="0.5" />
          <circle cx="150" cy="150" r="100" fill="none" stroke={primaryColor} strokeWidth="4" opacity="0.7" />
          
          {/* Main aura field */}
          <circle cx="150" cy="150" r="80" fill="url(#auraGradient)" filter="url(#glow)" />
          
          {/* Human silhouette */}
          <ellipse cx="150" cy="180" rx="25" ry="45" fill="#333" opacity="0.8" />
          <circle cx="150" cy="120" r="20" fill="#333" opacity="0.8" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Revealing your aura colors...</h4>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h4>No Aura Report Found</h4>
          <p>Please complete the Aura Perception assessment first.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigateToPath('aura')}
          >
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ 
      background: `linear-gradient(135deg, ${getColorHex(reportData.primaryColor)}20 0%, ${getColorHex(reportData.secondaryColors[0] || reportData.primaryColor)}20 100%)` 
    }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header */}
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3" style={{ color: getColorHex(reportData.primaryColor) }}>
                Your Aura Reading
              </h1>
              <p className="lead text-dark">Discover Your Energetic Signature</p>
            </div>

            {/* Aura Visualization and Score */}
            <div className="row mb-5">
              <div className="col-lg-6">
                <div className="card shadow-lg h-100">
                  <div className="card-header text-center py-4" style={{ 
                    background: getColorHex(reportData.primaryColor),
                    color: 'white' 
                  }}>
                    <h3 className="mb-0">Your Aura Field</h3>
                  </div>
                  <div className="card-body text-center py-4">
                    {renderAuraVisualization()}
                    <h4 className="mb-2" style={{ color: getColorHex(reportData.primaryColor) }}>
                      Primary: {reportData.primaryColor}
                    </h4>
                    <p className="text-muted mb-0">
                      Secondary: {reportData.secondaryColors.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-6">
                <div className="card shadow-lg h-100">
                  <div className="card-header bg-gradient text-white text-center py-4" style={{
                    background: `linear-gradient(135deg, ${getColorHex(reportData.primaryColor)} 0%, ${getColorHex(reportData.secondaryColors[0] || reportData.primaryColor)} 100%)`
                  }}>
                    <h3 className="mb-0">Aura Strength</h3>
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
                            stroke={getColorHex(reportData.primaryColor)}
                            strokeWidth="12"
                            strokeDasharray={`${(reportData.auraScore / 100) * 377} 377`}
                            strokeLinecap="round"
                            transform="rotate(-90 75 75)"
                          />
                          <text x="75" y="85" fontSize="32" textAnchor="middle" fill="#333" fontWeight="bold">
                            {reportData.auraScore}%
                          </text>
                        </svg>
                      </div>
                      <h4 className="mt-3" style={{ color: getColorHex(reportData.primaryColor) }}>
                        Aura Clarity
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Meanings */}
            <div className="card shadow-lg mb-5">
              <div className="card-header bg-dark text-white">
                <h3 className="mb-0">Your Aura Colors & Meanings</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div 
                        className="rounded-circle me-3"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          backgroundColor: getColorHex(reportData.primaryColor),
                          border: '3px solid white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                      ></div>
                      <h5 className="mb-0">Primary Color: {reportData.primaryColor}</h5>
                    </div>
                    <p className="text-muted">{reportData.colorMeanings.primary}</p>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="d-flex me-3">
                        {reportData.secondaryColors.map((color, index) => (
                          <div 
                            key={index}
                            className="rounded-circle"
                            style={{ 
                              width: '30px', 
                              height: '30px', 
                              backgroundColor: getColorHex(color),
                              border: '2px solid white',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                              marginLeft: index > 0 ? '-10px' : '0'
                            }}
                          ></div>
                        ))}
                      </div>
                      <h5 className="mb-0">Secondary: {reportData.secondaryColors.join(', ')}</h5>
                    </div>
                    <p className="text-muted">{reportData.colorMeanings.secondary}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personality Analysis */}
            <div className="row mb-5">
              <div className="col-md-6">
                <div className="card shadow-lg h-100">
                  <div className="card-header text-white" style={{ backgroundColor: getColorHex(reportData.primaryColor) }}>
                    <h4 className="mb-0">Personality Traits</h4>
                  </div>
                  <div className="card-body">
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
                      {reportData.personalityTraits}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card shadow-lg h-100">
                  <div className="card-header text-white" style={{ 
                    backgroundColor: getColorHex(reportData.secondaryColors[0] || reportData.primaryColor) 
                  }}>
                    <h4 className="mb-0">Emotional Energy</h4>
                  </div>
                  <div className="card-body">
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
                      {reportData.emotionalEnergy}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths and Growth */}
            <div className="row mb-5">
              <div className="col-md-6">
                <div className="card shadow-lg h-100 border-success">
                  <div className="card-header bg-success text-white">
                    <h4 className="mb-0">Your Strengths</h4>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-star-fill text-warning me-3 mt-1" style={{ fontSize: '1.5rem' }}></i>
                      <p style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
                        {reportData.strengths}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card shadow-lg h-100 border-info">
                  <div className="card-header bg-info text-white">
                    <h4 className="mb-0">Areas for Growth</h4>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-arrow-up-circle-fill text-primary me-3 mt-1" style={{ fontSize: '1.5rem' }}></i>
                      <p style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
                        {reportData.areasForGrowth}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Affirmation */}
            <div className="card shadow-lg mb-5" style={{ 
              background: `linear-gradient(135deg, ${getColorHex(reportData.primaryColor)}90 0%, ${getColorHex(reportData.secondaryColors[0] || reportData.primaryColor)}90 100%)`,
              color: 'white'
            }}>
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-heart-fill" style={{ fontSize: '3rem', opacity: 0.8 }}></i>
                </div>
                <h3 className="mb-4">Your Aura Affirmation</h3>
                <blockquote className="blockquote">
                  <p className="mb-0 fs-4 fst-italic">"{reportData.affirmation}"</p>
                </blockquote>
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
                className="btn btn-lg me-3"
                style={{ 
                  backgroundColor: getColorHex(reportData.primaryColor),
                  color: 'white',
                  border: 'none'
                }}
                onClick={() => window.print()}
              >
                Download Report
              </button>
              <button 
                className="btn btn-outline-dark btn-lg"
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

export default AuraReport;