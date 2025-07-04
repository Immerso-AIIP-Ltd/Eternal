import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/config';
import { getVedastroDataAndImage, generateJyotishReading } from './services/vedastro';
import { generateAuraReport, generateVibrationalReport } from './services/gpt';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { format } from 'date-fns';

type VedastroResult = {
  astrologyData: any;
  chartImages: any;
};

// Question sets for each path
const vibrationalQuestions = [
  {
    section: 'Mood & Mindset',
    questions: [
      {
        text: 'How do you feel emotionally most of the time?',
        options: ['Joyful', 'Calm', 'Neutral', 'Stressed', 'Angry', 'Sad']
      },
      {
        text: 'What thoughts usually pop into your mind?',
        options: ['Positive', 'Mixed', 'Doubtful', 'Negative']
      },
      {
        text: "Energy check! On a scale of 1-10, how's your energy today?",
        options: Array.from({ length: 10 }, (_, i) => (i + 1).toString()),
        isSlider: true
      }
    ],
    encouragement: "Awesome! You've done the first step. Just two more vibe zones to check."
  },
  {
    section: 'Body & Spirit',
    questions: [
      {
        text: 'Any physical tension, pain, or fatigue?',
        options: ['Yes', 'No'],
        followUp: 'Where?'
      },
      {
        text: 'Do you do anything like meditation, prayer, or just sit in silence?',
        options: ['Often', 'Sometimes', 'Rarely', 'Never']
      },
      {
        text: 'Do you feel connected to a purpose or inner voice?',
        options: ['Yes fully', 'Sometimes', 'Not really']
      }
    ],
    encouragement: "Nice! You're 2/3 done! Let's wrap up with a few quick vibe signals..."
  },
  {
    section: 'Environment & Intuition',
    questions: [
      {
        text: 'Do the people around you lift you up or bring you down?',
        options: ['Uplift me', 'Neutral', 'Drain me']
      },
      {
        text: 'How often do you spend time in nature or peaceful places?',
        options: ['Daily', 'Weekly', 'Rarely', 'Never']
      },
      {
        text: 'Do you get gut feelings or dreams that guide you?',
        options: ['Yes a lot', 'Sometimes', 'Not really']
      },
      {
        text: 'Want to try a sound or crystal frequency test later?',
        options: ['Yes please', 'Maybe', 'Not now']
      }
    ],
    encouragement: null
  }
];

const karmicQuestions = [
  {
    text: "Thanks for clicking! To make your reading even more accurate, could you please confirm the city and country of your birth?",
    key: 'birthPlace',
    placeholder: "e.g., New York, USA or Mumbai, India"
  },
  {
    text: "What's one area of your life you're most curious about right now? (e.g., career, relationships, health, spiritual growth)",
    key: 'lifeArea',
    placeholder: "e.g., career growth, finding love, health challenges"
  },
  {
    text: "Is there any specific challenge or recurring theme you've noticed in your life that you'd like some insight into?",
    key: 'challenge',
    placeholder: "e.g., repeated relationship patterns, financial blocks"
  }
];

const auraQuestions = [
  {
    text: "How would you describe your current emotional energy?",
    options: ["calm and peaceful", "passionate and energetic", "creative and adventurous", "thoughtful and introspective"]
  },
  {
    text: "When facing challenges, what is your usual approach?",
    options: ["facing them head-on with confidence", "looking for creative solutions", "reflecting deeply before acting", "seeking harmony and balance"]
  },
  {
    text: "Which environment makes you feel most recharged?",
    options: ["being in nature or quiet places", "social gatherings and lively events", "engaging in artistic or creative activities", "meditative or spiritual settings"]
  },
  {
    text: "Which word resonates with you most right now?",
    options: ["strength", "joy", "wisdom", "compassion"]
  }
];

// Helper functions
const formatDateForAPI = (dateString: string | undefined): string => {
  if (!dateString) return '01/01/2000';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const formatTimeForAPI = (timeString: string | undefined, timeFormat: string | undefined): string => {
  if (!timeString) return '00:00';
  const [time, period] = timeString.includes(' ') ? timeString.split(' ') : [timeString, timeFormat];
  let [hours, minutes] = time.split(':');
  if (period === 'PM' && hours !== '12') {
    hours = (parseInt(hours) + 12).toString();
  } else if (period === 'AM' && hours === '12') {
    hours = '00';
  }
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

const ChatHome: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Get path from URL params
  const urlParams = new URLSearchParams(location.search);
  const pathType = urlParams.get('path') as 'vibrational' | 'karmic' | 'aura' | null;
  
  // State management
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [profile, setProfile] = useState<any>({});
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat based on path
  useEffect(() => {
    if (!pathType || !currentUser) return;
    
    const initializeChat = async () => {
      // Fetch user profile
      const profileRef = doc(db, 'YourSoulAnswers', currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        setProfile(profileSnap.data());
      }
      
      // Initialize based on path type
      switch (pathType) {
        case 'vibrational':
          setMessages([
            { role: 'assistant', content: 'Vibrational Frequency Assessment' },
            { role: 'assistant', content: "Hey there! Ready to discover your vibrational vibe level? Just 2 minutes and I'll generate your custom report.\nLet's begin!" },
            { role: 'assistant', content: 'Section 1: Mood & Mindset (Q1-Q3)\nLet\'s check your inner world first.' },
            { role: 'assistant', content: vibrationalQuestions[0].questions[0].text }
          ]);
          break;
          
        case 'karmic':
          setMessages([
            { role: 'assistant', content: 'Karmic Awareness Reading' },
            { role: 'assistant', content: 'Welcome to your Karmic Awareness journey! I\'ll ask you 3 specific questions to create your personalized Jyotish reading.' },
            { role: 'assistant', content: karmicQuestions[0].text }
          ]);
          break;
          
        case 'aura':
          setMessages([
            { role: 'assistant', content: 'Aura Perception Analysis' },
            { role: 'assistant', content: 'Welcome to your Aura reading! I\'ll guide you through 4 questions to analyze your energy field and reveal your dominant aura colors.' },
            { role: 'assistant', content: auraQuestions[0].text }
          ]);
          break;
      }
    };
    
    initializeChat();
  }, [pathType, currentUser]);

  // Handle message sending
  const handleSendMessage = async () => {
    if (!message.trim() || !pathType || !currentUser) return;
    
    const userMsg = { role: 'user' as const, content: message };
    setMessages(prev => [...prev, userMsg]);
    
    if (pathType === 'vibrational') {
      await handleVibrationalFlow(message);
    } else if (pathType === 'karmic') {
      await handleKarmicFlow(message);
    } else if (pathType === 'aura') {
      await handleAuraFlow(message);
    }
    
    setMessage('');
  };

  // Vibrational flow handler
  const handleVibrationalFlow = async (answer: string) => {
    const section = vibrationalQuestions[currentSection];
    const question = section.questions[currentStep];
    
    // Store answer
    const newAnswers = { ...answers, [`${currentSection}_${currentStep}`]: answer };
    setAnswers(newAnswers);
    
    // Check for follow-up
    if ('followUp' in question && question.followUp && answer === 'Yes') {
      setShowFollowUp(true);
      return;
    }
    
    // Move to next question
    if (currentStep < section.questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: section.questions[currentStep + 1].text }]);
      }, 600);
    } else if (section.encouragement && currentSection < vibrationalQuestions.length - 1) {
      // Move to next section
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: section.encouragement! }]);
        setTimeout(() => {
          setCurrentSection(currentSection + 1);
          setCurrentStep(0);
          const nextSection = vibrationalQuestions[currentSection + 1];
          setMessages(prev => [...prev, 
            { role: 'assistant', content: `Section ${currentSection + 2}: ${nextSection.section}\n${getSectionDescription(currentSection + 1)}` },
            { role: 'assistant', content: nextSection.questions[0].text }
          ]);
        }, 1200);
      }, 600);
    } else {
      // Complete assessment
      await completeVibrationalAssessment(newAnswers);
    }
  };

  const getSectionDescription = (sectionIndex: number) => {
    const descriptions = [
      "Let's check your inner world first.",
      "Let's feel into your body and soul...",
      "Time to check the vibes around you..."
    ];
    return descriptions[sectionIndex] || "";
  };

  const completeVibrationalAssessment = async (finalAnswers: any) => {
    setGeneratingReport(true);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'All done! Based on your answers, I\'m tuning into your current vibrational frequency... One sec!' 
    }]);

    try {
      // Store answers in Firebase
      await setDoc(doc(db, 'vibrationalAnswers', currentUser.uid), {
        answers: finalAnswers,
        timestamp: serverTimestamp()
      });

      // Generate report using GPT-4.1
      const reportData = await generateVibrationalReport(finalAnswers);
      
      // Store report in Firebase
      await setDoc(doc(db, 'vibrationalReports', currentUser.uid), {
        ...reportData,
        generatedAt: serverTimestamp()
      });

      navigate('/vibrational-report');
    } catch (error) {
      console.error('Error generating vibrational report:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error generating your report. Please try again.' 
      }]);
      setGeneratingReport(false);
    }
  };

  // Karmic flow handler
  const handleKarmicFlow = async (answer: string) => {
    const currentQuestion = karmicQuestions[currentStep];
    const newAnswers = { ...answers, [currentQuestion.key]: answer };
    setAnswers(newAnswers);

    if (currentStep < karmicQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: karmicQuestions[currentStep + 1].text 
        }]);
      }, 600);
    } else {
      await completeKarmicAssessment(newAnswers);
    }
  };

  const completeKarmicAssessment = async (finalAnswers: any) => {
    setGeneratingReport(true);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'Thank you for your responses! I\'m now consulting the cosmic energies and generating your personalized Jyotish reading. This may take a moment...' 
    }]);

    try {
      // Prepare birth data
      const birthData = {
        location: finalAnswers.birthPlace || profile.location || 'Delhi, India',
        dob: formatDateForAPI(profile.dateOfBirth),
        tob: formatTimeForAPI(profile.timeOfBirth, profile.timeFormat),
        timezone: '+05:30'
      };

          const astrologyResult = await getVedastroDataAndImage(birthData) as VedastroResult | string;

      if (typeof astrologyResult === 'string') {
        throw new Error('Failed to fetch astrology data');
      }

      // Now TypeScript knows astrologyResult is VedastroResult
      await setDoc(doc(db, 'vedastroData', currentUser.uid), {
        astrologyData: astrologyResult.astrologyData,
        chartImages: astrologyResult.chartImages,
        birthData,
        timestamp: serverTimestamp()
      });

// ...and everywhere else you use astrologyResult.astrologyData or astrologyResult.chartImages

      // Generate Jyotish reading with GPT-4.1
      const jyotishReading = await generateJyotishReading({
        astrologyData: astrologyResult.astrologyData,
        userResponses: finalAnswers,
        birthData: birthData
      });

      // Store complete karmic report
      await setDoc(doc(db, 'karmicReports', currentUser.uid), {
        ...finalAnswers,
        birthData,
        astrologyData: astrologyResult.astrologyData,
        chartImages: astrologyResult.chartImages,
        jyotishReading,
        generatedAt: serverTimestamp()
      });

      navigate('/karmic-report');
    } catch (error) {
      console.error('Error generating karmic report:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but there was an error generating your reading. Please try again or contact support.' 
      }]);
      setGeneratingReport(false);
    }
  };

  // Aura flow handler
  const handleAuraFlow = async (answer: string) => {
    const newAnswers = { ...answers, [`question_${currentStep + 1}`]: answer };
    setAnswers(newAnswers);

    if (currentStep < auraQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: auraQuestions[currentStep + 1].text 
        }]);
      }, 600);
    } else {
      await completeAuraAssessment(newAnswers);
    }
  };

  const completeAuraAssessment = async (finalAnswers: any) => {
    setGeneratingReport(true);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'Perfect! I\'m now analyzing your energy field and revealing your aura colors. This will just take a moment...' 
    }]);

    try {
      // Store answers in Firebase
      await setDoc(doc(db, 'auraAnswers', currentUser.uid), {
        answers: finalAnswers,
        timestamp: serverTimestamp()
      });

      // Generate aura report using GPT-4.1
      const auraReport = await generateAuraReport(finalAnswers);
      
      // Store report in Firebase
      await setDoc(doc(db, 'auraReports', currentUser.uid), {
        ...auraReport,
        generatedAt: serverTimestamp()
      });

      navigate('/aura-report');
    } catch (error) {
      console.error('Error generating aura report:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error generating your aura report. Please try again.' 
      }]);
      setGeneratingReport(false);
    }
  };

  // Handle option button clicks for vibrational and aura paths
  const handleOptionClick = (option: string) => {
    setMessages(prev => [...prev, { role: 'user', content: option }]);
    
    if (pathType === 'vibrational') {
      handleVibrationalFlow(option);
    } else if (pathType === 'aura') {
      handleAuraFlow(option);
    }
  };

  // Handle follow-up for vibrational path
  const handleFollowUp = () => {
    setMessages(prev => [...prev, { role: 'user', content: followUpAnswer }]);
    const updatedAnswers = { ...answers, [`${currentSection}_${currentStep}_followup`]: followUpAnswer };
    setAnswers(updatedAnswers);
    setShowFollowUp(false);
    setFollowUpAnswer('');
    
    // Continue to next question
    const section = vibrationalQuestions[currentSection];
    if (currentStep < section.questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: section.questions[currentStep + 1].text }]);
      }, 600);
    } else if (section.encouragement && currentSection < vibrationalQuestions.length - 1) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: section.encouragement! }]);
        setTimeout(() => {
          setCurrentSection(currentSection + 1);
          setCurrentStep(0);
          const nextSection = vibrationalQuestions[currentSection + 1];
          setMessages(prev => [...prev, 
            { role: 'assistant', content: `Section ${currentSection + 2}: ${nextSection.section}\n${getSectionDescription(currentSection + 1)}` },
            { role: 'assistant', content: nextSection.questions[0].text }
          ]);
        }, 1200);
      }, 600);
    } else {
      completeVibrationalAssessment(updatedAnswers);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Render current question options
  const renderQuestionOptions = () => {
    if (generatingReport || showFollowUp) return null;

    if (pathType === 'vibrational') {
      const section = vibrationalQuestions[currentSection];
      if (!section || !section.questions[currentStep]) return null;
      
      const question = section.questions[currentStep];
      
      if ('isSlider' in question && question.isSlider) {
        return (
          <div className="d-flex flex-column align-items-center mb-3">
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={message || '5'} 
              onChange={e => setMessage(e.target.value)} 
              style={{ width: 200 }} 
            />
            <div className="mt-2">Energy: {message || 5}</div>
            <button 
              className="btn btn-primary mt-2" 
              onClick={() => handleOptionClick(message || '5')}
            >
              Submit
            </button>
          </div>
        );
      }
      
      return (
        <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
          {question.options.map(opt => (
            <button 
              key={opt} 
              className="btn btn-outline-primary" 
              onClick={() => handleOptionClick(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (pathType === 'aura' && currentStep < auraQuestions.length) {
      const question = auraQuestions[currentStep];
      return (
        <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
          {question.options.map(opt => (
            <button 
              key={opt} 
              className="btn btn-outline-primary" 
              onClick={() => handleOptionClick(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }

    return null;
  };

  // Generate vibrational report using GPT-4.1
 const generateVibrationalReportWithFallback = async (answers: any) => {
  try {
    return await generateVibrationalReport(answers); // This calls the imported function
  } catch (error) {
    console.error('Error generating vibrational report:', error);
    return {
      frequency: 456,
      level: "Peaceful Explorer",
      percentage: 76,
      description: "Your vibes show emotional calm, spiritual openness, and light energy blocks.",
      recommendations: ["daily nature walks", "more hydration", "5 mins of silence today"]
    };
  }
};

  if (!pathType) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h3>Invalid Path</h3>
          <p>Please select a valid spiritual assessment path.</p>
          <button className="btn btn-primary" onClick={() => navigate('/onboarding-one')}>
            Choose Path
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: '#f7f7fa' }}>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Progress indicator */}
            {pathType === 'vibrational' && (
              <div className="text-center mb-4">
                <div className="progress" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ 
                      width: `${((currentSection * 3 + currentStep + 1) / 10) * 100}%` 
                    }}
                  ></div>
                </div>
                <small className="text-muted mt-2">
                  Question {currentSection * 3 + currentStep + 1} of 10
                </small>
              </div>
            )}

            {pathType === 'karmic' && (
              <div className="text-center mb-4">
                <div className="progress" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
                  ></div>
                </div>
                <small className="text-muted mt-2">
                  Question {currentStep + 1} of 3
                </small>
              </div>
            )}

            {pathType === 'aura' && (
              <div className="text-center mb-4">
                <div className="progress" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
                  ></div>
                </div>
                <small className="text-muted mt-2">
                  Question {currentStep + 1} of 4
                </small>
              </div>
            )}

            {/* Chat messages */}
            <div className="bg-white rounded-4 shadow-sm p-4 mb-4" style={{ minHeight: '400px' }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="me-2">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" 
                           style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)' }}>
                        <span style={{ color: 'white', fontSize: 16 }}>✨</span>
                      </div>
                    </div>
                  )}
                  <div className={`p-3 rounded-4 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-light'}`} 
                       style={{ maxWidth: '70%' }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Question options */}
            {renderQuestionOptions()}

            {/* Follow-up input for vibrational path */}
            {showFollowUp && (
              <div className="d-flex flex-column align-items-center mb-3">
                <input 
                  type="text" 
                  className="form-control mb-2" 
                  placeholder="Where?" 
                  value={followUpAnswer} 
                  onChange={e => setFollowUpAnswer(e.target.value)} 
                  style={{ maxWidth: 240 }} 
                />
                <button className="btn btn-primary" onClick={handleFollowUp}>
                  Submit
                </button>
              </div>
            )}

            {/* Manual input for karmic path */}
            {pathType === 'karmic' && currentStep < karmicQuestions.length && !generatingReport && (
              <div className="d-flex align-items-center bg-white rounded-4 shadow-sm px-3 py-2">
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder={karmicQuestions[currentStep]?.placeholder || "Type your answer..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="btn btn-primary ms-2"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  Send
                </button>
              </div>
            )}

            {/* Loading state */}
            {generatingReport && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5>Generating your personalized report...</h5>
                <p className="text-muted">This may take a moment while we analyze your responses.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHome;