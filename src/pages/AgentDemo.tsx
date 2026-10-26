import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Bot,
  User,
  CheckCheck,
  Sparkles,
  FileText,
  ShieldCheck,
  Zap,
  Volume2,
  AlertTriangle,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  Camera,
  Smartphone,
  Cpu,
  Layers,
  HelpCircle,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateMerchant, saveApplication, addActivity, getMerchants } from '@/lib/store';

// ─── Simulation Step Interface ────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  sender: 'nexa' | 'merchant' | 'system';
  text: string;
  timestamp: string;
  image?: string;
  audioAnnouncement?: string;
  meta?: string;
}

interface AgentTraceStep {
  stepIndex: number;
  phaseTitle: string;
  badge: string;
  badgeColor: string;
  thought: string;
  toolCall?: {
    toolName: string;
    params: Record<string, any>;
  };
  observation?: {
    summary: string;
    jsonPayload?: Record<string, any>;
    metrics?: Record<string, string | number>;
  };
  validationChecks?: Array<{
    label: string;
    passed: boolean;
    detail: string;
  }>;
  stateTransition: {
    from: string;
    to: string;
  };
  fseInsight: string;
}

interface DemoScenario {
  id: string;
  merchantName: string;
  businessName: string;
  businessType: string;
  location: string;
  phone: string;
  messages: ChatMessage[];
  traces: AgentTraceStep[];
}

// ─── Scenario Data: Raju Bhai (Kirana) ────────────────────────────────────────

const RAJU_SCENARIO: DemoScenario = {
  id: 'scenario-raju',
  merchantName: 'Raju Sharma',
  businessName: 'Raju General Store',
  businessType: 'Grocery / Kirana',
  location: 'Shop 12, MG Road, Bengaluru',
  phone: '+91 98765 43210',
  messages: [
    {
      id: 'm1',
      sender: 'system',
      text: '🤝 FSE Arjun Sharma initiated lead hand-off to NEXA Autonomous Teammate.',
      timestamp: '11:15 AM',
    },
    {
      id: 'm2',
      sender: 'nexa',
      text: 'Namaste Raju Bhai! 🙏 Main NEXA hoon, Paytm ka AI sales teammate. Arjun ji ne bataya ki aap Raju General Store ke liye Paytm digital payment lagwana chahte hain.\n\nAapko kahin jaane ki zaroorat nahi hai. Bas apni dukaan ke board ya GST certificate ki ek photo yahan bhej dijiye, baaki kaam main sambhal loonga!',
      timestamp: '11:16 AM',
    },
    {
      id: 'm3',
      sender: 'merchant',
      text: 'Yeh lijiye photo, dukaan par GST certificate tanga hua hai.',
      timestamp: '11:18 AM',
      image: 'gst_certificate',
    },
    {
      id: 'm4',
      sender: 'nexa',
      text: 'Shukriya Raju bhai! Maine aapki details scan kar li hain:\n\n🏪 Dukaan: Raju General Stores\n📍 Pata: Shop 12, MG Road, Bengaluru - 560001\n🔢 GSTIN: 29ABCDE1234F1Z5 (Karnataka)\n\nKya yeh details bilkul sahi hain? Aur roz lagbhag kitne customers aate hain aur online pay karte hain?',
      timestamp: '11:19 AM',
    },
    {
      id: 'm5',
      sender: 'merchant',
      text: 'Haan bhai sab theek hai. Shaam ko bahut bheed hoti hai, din ke 60-70 log online pay karte hain.',
      timestamp: '11:21 AM',
    },
    {
      id: 'm6',
      sender: 'nexa',
      text: 'Aapki dukaan ke liye sabse best setup rahega:\n\n🔊 Paytm 4G Soundbox + All-in-One QR Stand\n💰 Setup Fee: ₹1,998 (One-time)\n\nFayda: Shaam ki bheed mein jab bhi koi customer payment karega, Soundbox turant tez aawaz mein bolega: "Paytm par 150 rupaye prapt hue".\n\nAapko counter chhodkar baar-baar mobile dekhne ki zaroorat nahi padegi!\n\nKya main aapka application submit kar doon?',
      timestamp: '11:22 AM',
      audioAnnouncement: 'Paytm par 150 rupaye prapt hue 🔊',
    },
    {
      id: 'm7',
      sender: 'merchant',
      text: 'Bhai device toh accha hai, par baad mein koi monthly kiraya ya hidden charge toh nahi lagega?',
      timestamp: '11:24 AM',
    },
    {
      id: 'm8',
      sender: 'nexa',
      text: 'Bilkul sahi sawal Raju bhai! Is plan mein koi chupa hua charge nahi hai. ₹1,499 Soundbox ka one-time cost hai, zero monthly rental. Lifetime SMS alerts free hain.\n\nAapke daily 65 online payments hain—toh fake screenshot fraud se bachne ke liye yeh device pehle 10 din mein hi apna poora kharcha nikal lega!\n\nKya main abhi finalize kar doon?',
      timestamp: '11:25 AM',
    },
    {
      id: 'm9',
      sender: 'merchant',
      text: 'Haan bhai samajh gaya. Bilkul kar do finalize!',
      timestamp: '11:27 AM',
    },
    {
      id: 'm10',
      sender: 'nexa',
      text: 'Badhai ho Raju bhai! 🎉 Aapka Paytm onboarding complete ho chuka hai.\n\n📋 Application No: PAYTM-BLR-9921\n📦 Device Package: 4G Soundbox + QR Stand\n\nKal subah 11:00 baje Arjun ji aapki dukaan par aakar device deliver aur activate kar denge. Welcome to Paytm! 🚀',
      timestamp: '11:28 AM',
    },
  ],
  traces: [
    {
      stepIndex: 0,
      phaseTitle: 'Hand-Off & Session Initialization',
      badge: 'PROACTIVE TRIGGER',
      badgeColor: 'bg-blue-100 text-[#002970]',
      thought:
        'FSE Arjun completed a 3-minute physical shop visit and registered lead (+91 98765 43210). Triggering proactive outreach in native Hindi/Hinglish to lock in merchant interest before drop-off.',
      toolCall: {
        toolName: 'init_merchant_session',
        params: { phone: '+919876543210', assignedFse: 'Arjun S. (exec-001)', territory: 'Bengaluru Central' },
      },
      observation: {
        summary: 'WhatsApp session active. Timer set to monitor response within 4 hours.',
        metrics: { 'Merchant State': 'NEW', 'Expected Turnaround': '<15 mins', 'Human Effort': '3 mins' },
      },
      stateTransition: { from: 'UNASSIGNED', to: 'NEW' },
      fseInsight: 'Arjun is already on his bike heading to shop #2 while NEXA initiates contact.',
    },
    {
      stepIndex: 1,
      phaseTitle: 'Multimodal Document Vision & Extraction',
      badge: 'VISION OCR',
      badgeColor: 'bg-purple-100 text-purple-800',
      thought:
        'Merchant uploaded a 1.8MB photo of his framed GST Certificate. Forwarding to Gemini 2.0 Flash Vision to extract structured fields and spatial bounding boxes.',
      toolCall: {
        toolName: 'read_document',
        params: { mimeType: 'image/jpeg', documentType: 'gst_certificate', confidenceThreshold: 0.85 },
      },
      observation: {
        summary: 'Parsed legal entity name, GSTIN code, state jurisdiction, and full premises address.',
        jsonPayload: {
          gstin: '29ABCDE1234F1Z5',
          legalName: 'Raju General Stores',
          tradeName: 'Raju General Store',
          address: 'Shop 12, MG Road, Bengaluru, Karnataka, 560001',
          stateCode: '29 (Karnataka)',
        },
        metrics: { 'Extraction Confidence': '96.4%', 'Fields Recovered': '5 / 5', 'Latency': '1.1s' },
      },
      validationChecks: [
        { label: 'GSTIN Checksum Format', passed: true, detail: 'Compliant with 15-char Indian GST standard' },
        { label: 'State PIN Code Match', passed: true, detail: '560001 matches Karnataka jurisdiction' },
        { label: 'FASCAI / Trade Registration', passed: true, detail: 'Retail grocery category confirmed' },
      ],
      stateTransition: { from: 'NEW', to: 'EXTRACTING' },
      fseInsight: 'Eliminates 12 minutes of painful mobile typing and prevents typo rejections.',
    },
    {
      stepIndex: 2,
      phaseTitle: 'Profiling & Verification',
      badge: 'DYNAMIC PROFILING',
      badgeColor: 'bg-cyan-100 text-[#007FA5]',
      thought:
        'Merchant verified extracted address and stated daily digital transaction volume is 60–70 transactions with high evening footfall noise. Running recommendation engine.',
      toolCall: {
        toolName: 'validate_merchant_data',
        params: { gstin: '29ABCDE1234F1Z5', phone: '9876543210', businessType: 'grocery', confirmed: true },
      },
      observation: {
        summary: 'Profile verified. Transaction velocity qualifies merchant for Paytm Soundbox 4.0 hardware package.',
        metrics: { 'Estimated Monthly Volume': '₹1,50,000+', 'Daily Txns': '60-70', 'Noise Risk': 'High' },
      },
      stateTransition: { from: 'EXTRACTING', to: 'NEEDS_REVIEW' },
      fseInsight: 'Junior FSEs often give free QR codes here. NEXA identifies the high-value Soundbox match.',
    },
    {
      stepIndex: 3,
      phaseTitle: 'Algorithmic Hardware Recommendation',
      badge: 'RECOMMENDATION ENGINE',
      badgeColor: 'bg-amber-100 text-amber-800',
      thought:
        'Volume > 50 txns/day + grocery retail + noisy counter = Soundbox 4.0. Formulating transparent ROI pitch in Hindi focusing on fake screenshot fraud prevention.',
      toolCall: {
        toolName: 'check_eligibility_and_recommend',
        params: {
          businessType: 'grocery',
          dailyTransactions: 65,
          needsAudioAlert: true,
          budgetConstraint: 'medium',
        },
      },
      observation: {
        summary: 'Recommended Primary: Paytm Soundbox 4.0 + QR Stand. Alternative: QR Stand only.',
        jsonPayload: {
          recommendedSetup: 'QR Stand + Soundbox 4.0',
          totalPrice: 1998,
          reasons: [
            'Audio payment confirmation crucial during peak rush hours',
            'High transaction frequency (65/day) justifies hardware investment',
            'Eliminates fraud from fake payment screenshots',
          ],
        },
        metrics: { 'Primary Setup': '₹1,998', 'Payback Period': '10 Days', 'Fraud Protection': '100%' },
      },
      stateTransition: { from: 'NEEDS_REVIEW', to: 'RECOMMENDED' },
      fseInsight: 'NEXA pitches the exact right hardware tier with instant explainability.',
    },
    {
      stepIndex: 4,
      phaseTitle: 'Autonomous Objection Handling (Hindi/Hinglish)',
      badge: 'OBJECTION AGENT',
      badgeColor: 'bg-orange-100 text-orange-800',
      thought:
        'Merchant expressed hesitation regarding monthly rentals ("monthly kiraya"). Category: pricing_hidden_charges. Accessing corporate policy knowledge base. Explaining zero-rental terms and economic ROI.',
      toolCall: {
        toolName: 'resolve_merchant_objection',
        params: {
          category: 'pricing_hidden_charges',
          merchantLanguage: 'hinglish',
          device: 'soundbox_4',
        },
      },
      observation: {
        summary: 'Objection resolved without human escalation. Merchant agreement secured.',
        metrics: { 'Sentiment Shift': 'Skeptical → Reassured', 'Human Escalation Triggered': 'No' },
      },
      stateTransition: { from: 'RECOMMENDED', to: 'AGREEMENT_REACHED' },
      fseInsight: 'Traditional bots fail on vernacular pricing doubts. NEXA handles Hindi nuances smoothly.',
    },
    {
      stepIndex: 5,
      phaseTitle: 'Application Compilation & FSE Dispatch',
      badge: 'EXECUTION & COMMIT',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      thought:
        'Merchant accepted. Compiling official onboarding contract, validating 5/5 readiness checks, and dispatching delivery task to Arjun for tomorrow 11:00 AM.',
      toolCall: {
        toolName: 'submit_onboarding_application',
        params: {
          merchantId: 'm-001',
          applicationNumber: 'PAYTM-BLR-9921',
          devicePackage: ['dev-001', 'dev-002'],
          scheduledDispatch: 'Tomorrow 11:00 AM',
        },
      },
      observation: {
        summary: 'Application marked READY FOR REVIEW / SUBMITTED. State synchronized to PostgreSQL database.',
        jsonPayload: {
          applicationId: 'app-9921',
          readinessScore: '100% (5/5 checks passed)',
          merchantStatus: 'ready_for_submission',
          fseActionRequired: 'Hardware delivery only',
        },
        metrics: { 'Total Cycle Time': '12 mins', 'Human Admin Time': '0 mins', 'Readiness Score': '100%' },
      },
      validationChecks: [
        { label: 'Business Name Validated', passed: true, detail: 'Raju General Stores' },
        { label: 'Proprietor Identified', passed: true, detail: 'Raju Sharma' },
        { label: 'Mobile Number Verified', passed: true, detail: '+91 98765 43210' },
        { label: 'Premises Address Complete', passed: true, detail: 'Shop 12, MG Road, Bengaluru 560001' },
        { label: 'Hardware Package Selected', passed: true, detail: 'QR Stand + Soundbox (₹1,998)' },
      ],
      stateTransition: { from: 'AGREEMENT_REACHED', to: 'READY_FOR_SUBMISSION' },
      fseInsight: 'Deal closed! Arjun receives a clean delivery task on his phone without doing any manual paperwork.',
    },
  ],
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function AgentDemo() {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'trace' | 'json' | 'device' | 'impact'>('trace');
  const [audioPlaying, setAudioPlaying] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const scenario = RAJU_SCENARIO;
  const currentTrace = scenario.traces[currentStepIndex] || scenario.traces[0];

  // Messages to show up to current step
  const visibleMessagesCount = Math.min((currentStepIndex + 1) * 2, scenario.messages.length);
  const visibleMessages = scenario.messages.slice(0, visibleMessagesCount);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [visibleMessagesCount, currentStepIndex]);

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && currentStepIndex < scenario.traces.length - 1) {
      timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 4000);
    } else if (currentStepIndex >= scenario.traces.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, scenario.traces.length]);

  const handleNext = () => {
    if (currentStepIndex < scenario.traces.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const playSoundboxAudio = () => {
    setAudioPlaying(true);
    // Simulating the Paytm Soundbox voice announcement
    const utterance = new SpeechSynthesisUtterance('Paytm par ek sau pachaas rupaye prapt hue');
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setAudioPlaying(false);
    utterance.onerror = () => setAudioPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  // Sync state to local store when reaching final step
  const handleViewInDashboard = () => {
    // Update Sharma General Store (m-001) in store to ready_for_submission
    updateMerchant('m-001', {
      businessName: 'Raju General Stores',
      ownerName: 'Raju Sharma',
      status: 'ready_for_submission',
      completeness: 100,
      paymentNeeds: ['qr_payments', 'soundbox'],
      estimatedMonthlyVolume: 150000,
      estimatedTransactionsPerDay: 65,
      needsAudibleConfirmation: true,
      budget: '1000_3000',
    });

    const savedApp = saveApplication({
      merchantId: 'm-001',
      status: 'ready_for_review',
      formData: {
        businessName: 'Raju General Stores',
        ownerName: 'Raju Sharma',
        businessType: 'grocery',
        phone: '9876543210',
        gstin: '29ABCDE1234F1Z5',
        address: {
          line1: 'Shop 12, MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
        },
        deviceSetup: 'QR Stand + Soundbox (₹1,998)',
        deviceProductIds: ['dev-001', 'dev-002'],
      },
      readinessChecks: [
        { key: 'business_name', label: 'Business name provided', passed: true },
        { key: 'owner_name', label: 'Owner name provided', passed: true },
        { key: 'phone', label: 'Valid phone number', passed: true },
        { key: 'address', label: 'Complete address', passed: true },
        { key: 'device', label: 'Device setup selected', passed: true },
      ],
    });

    addActivity({
      merchantId: 'm-001',
      merchantName: 'Raju General Stores',
      action: 'NEXA Agent completed autonomous onboarding on WhatsApp',
      timestamp: new Date().toISOString(),
      status: 'ready_for_submission',
    });

    navigate(`/applications/${savedApp.id}`);
  };

  return (
    <div className="min-h-full bg-[#F5F8FC] p-3 sm:p-5 flex flex-col space-y-3">
      {/* ─── Top Control & Status Header ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E4EAF2] p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF9FE] text-[#002970] border border-[#B2E9FC]">
                <Sparkles className="w-3.5 h-3.5 text-[#00BAF2]" />
                Track 3: Autonomous AI Teammates
              </span>
              <span className="text-[11px] font-semibold text-[#16845B] bg-[#ECFDF3] px-2 py-0.5 rounded-full border border-[#D1FADF] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16845B] animate-pulse" />
                Live Agent Simulation
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[#002970] mt-1 tracking-tight flex items-center gap-2">
              NEXA Autonomous Teammate Studio
            </h1>
            <p className="text-xs text-[#667085] mt-0.5">
              Watch NEXA autonomously engage, extract documents, overcome objections, and onboard{' '}
              <strong className="text-[#172B4D]">Raju General Store</strong> on WhatsApp while FSE Arjun is on the move.
            </p>
          </div>

          {/* Player Controls */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center bg-[#F8F9FC] border border-[#E4EAF2] rounded-lg p-1">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="p-1.5 rounded hover:bg-white text-[#667085] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs',
                  isPlaying
                    ? 'bg-[#F04438] text-white hover:bg-[#D92D20]'
                    : 'bg-[#002970] text-white hover:bg-[#001f56]'
                )}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Auto-Play
                  </>
                )}
              </button>
              <button
                onClick={handleNext}
                disabled={currentStepIndex === scenario.traces.length - 1}
                className="p-1.5 rounded hover:bg-white text-[#667085] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="Next step"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleReset}
              className="p-2 border border-[#E4EAF2] rounded-lg text-[#667085] hover:text-[#172B4D] hover:bg-[#F8F9FC] transition-colors"
              title="Reset simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {currentStepIndex === scenario.traces.length - 1 && (
              <button
                onClick={handleViewInDashboard}
                className="px-3.5 py-1.5 bg-[#00BAF2] hover:bg-[#009fd0] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 animate-bounce transition-all"
              >
                <span>View Generated Application in Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Timeline Stepper */}
        <div className="mt-3 pt-3 border-t border-[#E4EAF2] grid grid-cols-2 sm:grid-cols-6 gap-1.5">
          {scenario.traces.map((trace, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <button
                key={trace.stepIndex}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setIsPlaying(false);
                }}
                className={cn(
                  'text-left p-1.5 rounded border transition-all text-[11px]',
                  isCurrent
                    ? 'bg-[#EBF9FE] border-[#00BAF2] text-[#002970] font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-white border-[#D1FADF] text-[#16845B]'
                    : 'bg-[#F8F9FC] border-[#E4EAF2] text-[#98A2B3]'
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">
                    Step {idx + 1}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-[#16845B]" />}
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-[#00BAF2] animate-ping" />}
                </div>
                <p className="truncate font-medium">{trace.phaseTitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Main Two-Column Interactive Canvas ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-[580px]">
        {/* ─── Left Column: Smartphone WhatsApp Mockup (5 Cols) ──────────────── */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[380px] bg-white rounded-3xl border-4 border-[#1E293B] shadow-xl overflow-hidden flex flex-col h-[620px]">
            {/* Phone Bezel Top Status Bar */}
            <div className="bg-[#002970] text-white px-4 pt-1.5 pb-1 flex items-center justify-between text-[11px] font-mono">
              <span>9:41</span>
              <div className="w-16 h-3 bg-black/40 rounded-full mx-auto" />
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* WhatsApp App Header */}
            <div className="bg-[#002970] text-white px-3 py-2.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-[#00BAF2] flex items-center justify-center font-bold text-white text-xs shadow-xs border border-white/20">
                    NEXA
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#16845B] border-2 border-[#002970]" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h2 className="text-xs font-bold leading-tight">Paytm NEXA Agent</h2>
                    <span className="text-[9px] bg-white/20 px-1 py-0.2 rounded text-white font-mono">Verified</span>
                  </div>
                  <p className="text-[10px] text-[#B2E9FC] leading-tight">Autonomous Sales Teammate</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-[#E4EAF2] font-mono bg-black/20 px-1.5 py-0.5 rounded">
                  Raju Sharma
                </span>
                <p className="text-[9px] text-[#98A2B3] mt-0.5">+91 98765 43210</p>
              </div>
            </div>

            {/* WhatsApp Chat Body */}
            <div
              ref={chatScrollRef}
              className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#EFEAE2] relative"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.02) 10%, transparent 10%)',
                backgroundSize: '16px 16px',
              }}
            >
              {/* Security Pill */}
              <div className="text-center my-1">
                <span className="inline-block bg-[#FFF3C4] text-[#7A4F01] text-[9px] px-2 py-0.5 rounded-md shadow-2xs font-medium">
                  🔒 End-to-end encrypted · Paytm Official Partner Verified
                </span>
              </div>

              {visibleMessages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="text-center my-1.5">
                      <span className="inline-block bg-white/80 backdrop-blur-xs text-[#002970] border border-[#B2E9FC] text-[10px] px-2.5 py-1 rounded-full shadow-2xs font-medium">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isNexa = msg.sender === 'nexa';

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex flex-col max-w-[85%] text-xs rounded-xl p-2.5 shadow-2xs relative leading-relaxed',
                      isNexa
                        ? 'bg-white text-[#172B4D] self-start rounded-tl-xs border border-[#E2E8F0]'
                        : 'bg-[#D9FDD3] text-[#111B21] self-end rounded-tr-xs border border-[#C1EAC0]'
                    )}
                  >
                    {/* Image Attachment Mockup */}
                    {msg.image && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-black/10 bg-white p-2">
                        <div className="bg-[#FFFDF5] border border-amber-300 rounded p-2 text-[10px] font-mono text-gray-800 space-y-1">
                          <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                            <span className="font-bold text-[#002970]">GOVT OF INDIA · GST REGISTRATION</span>
                            <span className="text-[9px] bg-green-100 text-green-800 px-1 rounded">FORM REG-06</span>
                          </div>
                          <p><strong>Entity:</strong> RAJU GENERAL STORES</p>
                          <p><strong>GSTIN:</strong> 29ABCDE1234F1Z5</p>
                          <p><strong>Address:</strong> Shop 12, MG Road, Bengaluru - 560001</p>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[9px] text-[#667085]">
                          <span className="flex items-center gap-1">
                            <Camera className="w-2.5 h-2.5" /> IMG_20261026_1118.jpg
                          </span>
                          <span className="text-emerald-600 font-semibold">1.8 MB · OCR Scanned</span>
                        </div>
                      </div>
                    )}

                    {/* Speech / Audio simulation pill if soundbox message */}
                    {msg.audioAnnouncement && (
                      <div className="mb-2 p-2 rounded-lg bg-[#EBF9FE] border border-[#B2E9FC] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#002970]">
                          <Volume2 className="w-4 h-4 text-[#00BAF2]" />
                          <span>Soundbox 4.0 Voice Alert</span>
                        </div>
                        <button
                          onClick={playSoundboxAudio}
                          disabled={audioPlaying}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00BAF2] text-white hover:bg-[#009fd0] active:scale-95 transition-all shadow-2xs"
                        >
                          {audioPlaying ? 'Playing…' : 'Hear Sound 🔊'}
                        </button>
                      </div>
                    )}

                    {/* Message Text with newlines */}
                    <div className="whitespace-pre-line text-[11.5px]">{msg.text}</div>

                    {/* Timestamp + Blue Tick */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#667085]">
                      <span>{msg.timestamp}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* WhatsApp Mock Input Bar */}
            <div className="bg-[#F0F2F5] px-2.5 py-2 border-t border-[#E4EAF2] flex items-center gap-1.5">
              <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-[#98A2B3] flex items-center justify-between border border-[#E4EAF2]">
                <span className="truncate">
                  {currentStepIndex === 5 ? 'Application completed' : 'Raju Bhai is responding…'}
                </span>
                <Camera className="w-3.5 h-3.5 text-[#667085]" />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#00A884] flex items-center justify-center text-white shadow-xs">
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column: NEXA Agent Brain & Live ReAct Trace (7 Cols) ─────── */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {/* Brain Header with Tabs */}
          <div className="bg-white rounded-xl border border-[#E4EAF2] p-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E4EAF2]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#002970] text-white flex items-center justify-center shadow-xs">
                  <Cpu className="w-4 h-4 text-[#00BAF2]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#002970] tracking-tight flex items-center gap-1.5">
                    NEXA Agent Brain
                    <span className="text-[10px] font-mono text-[#00BAF2] bg-[#EBF9FE] px-1.5 py-0.2 rounded border border-[#B2E9FC]">
                      ReAct Engine v2.4
                    </span>
                  </h3>
                  <p className="text-[10px] text-[#667085]">
                    Real-time reasoning, tool invocation, and deterministic validation guardrails
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#667085]">State:</span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#F8F9FC] border border-[#E4EAF2] text-[#002970]">
                  {currentTrace.stateTransition.from} → {currentTrace.stateTransition.to}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 pt-2">
              <button
                onClick={() => setActiveTab('trace')}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                  activeTab === 'trace'
                    ? 'bg-[#002970] text-white font-semibold shadow-xs'
                    : 'text-[#667085] hover:bg-[#F5F8FC] hover:text-[#172B4D]'
                )}
              >
                <Zap className="w-3.5 h-3.5 text-[#00BAF2]" />
                Live ReAct Trace
              </button>

              <button
                onClick={() => setActiveTab('json')}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                  activeTab === 'json'
                    ? 'bg-[#002970] text-white font-semibold shadow-xs'
                    : 'text-[#667085] hover:bg-[#F5F8FC] hover:text-[#172B4D]'
                )}
              >
                <FileText className="w-3.5 h-3.5 text-[#00BAF2]" />
                Structured Extraction & Checks
              </button>

              <button
                onClick={() => setActiveTab('device')}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                  activeTab === 'device'
                    ? 'bg-[#002970] text-white font-semibold shadow-xs'
                    : 'text-[#667085] hover:bg-[#F5F8FC] hover:text-[#172B4D]'
                )}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#00BAF2]" />
                Hardware Recommendation Logic
              </button>

              <button
                onClick={() => setActiveTab('impact')}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                  activeTab === 'impact'
                    ? 'bg-[#002970] text-white font-semibold shadow-xs'
                    : 'text-[#667085] hover:bg-[#F5F8FC] hover:text-[#172B4D]'
                )}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#00BAF2]" />
                FSE & Business ROI
              </button>
            </div>
          </div>

          {/* Tab 1: Live ReAct Trace View */}
          {activeTab === 'trace' && (
            <div className="bg-white rounded-xl border border-[#E4EAF2] p-4 shadow-xs flex-1 space-y-3.5 overflow-y-auto max-h-[510px]">
              {/* Step Title Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E4EAF2]">
                <div className="flex items-center gap-2">
                  <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-md font-mono', currentTrace.badgeColor)}>
                    {currentTrace.badge}
                  </span>
                  <span className="text-xs font-bold text-[#172B4D]">
                    Phase {currentStepIndex + 1}: {currentTrace.phaseTitle}
                  </span>
                </div>
                <span className="text-[11px] text-[#667085] font-mono">Step {currentStepIndex + 1} of 6</span>
              </div>

              {/* Thought Box */}
              <div className="rounded-lg bg-[#F8F9FC] border border-[#E4EAF2] p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#002970]">
                  <Bot className="w-3.5 h-3.5 text-[#00BAF2]" />
                  <span>Agent Reasoning (Thought)</span>
                </div>
                <p className="text-xs text-[#344054] leading-relaxed italic bg-white p-2.5 rounded border border-[#E4EAF2]">
                  "{currentTrace.thought}"
                </p>
              </div>

              {/* Tool Invocation Card */}
              {currentTrace.toolCall && (
                <div className="rounded-lg bg-[#FFF9F5] border border-[#FEE4D2] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#B54708] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Tool Executed: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#FEE4D2]">{currentTrace.toolCall.toolName}()</code>
                    </span>
                    <span className="text-[10px] text-[#B54708] font-mono">Status: SUCCESS</span>
                  </div>
                  <pre className="text-[11px] font-mono bg-[#1E293B] text-[#38BDF8] p-2.5 rounded-md overflow-x-auto">
                    {JSON.stringify(currentTrace.toolCall.params, null, 2)}
                  </pre>
                </div>
              )}

              {/* Observation Card */}
              {currentTrace.observation && (
                <div className="rounded-lg bg-[#ECFDF3] border border-[#A6F4C5] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#027A48] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Observation & Output
                    </span>
                    <span className="text-[10px] font-mono text-[#027A48]">Confirmed</span>
                  </div>
                  <p className="text-xs text-[#054F31] font-medium">{currentTrace.observation.summary}</p>

                  {/* Metrics Row */}
                  {currentTrace.observation.metrics && (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {Object.entries(currentTrace.observation.metrics).map(([key, val]) => (
                        <div key={key} className="bg-white/80 p-2 rounded border border-[#A6F4C5]">
                          <p className="text-[10px] text-[#667085] truncate">{key}</p>
                          <p className="text-xs font-bold text-[#027A48] mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* FSE Context Callout */}
              <div className="rounded-lg bg-[#EBF9FE] border border-[#B2E9FC] p-2.5 flex items-start gap-2">
                <User className="w-4 h-4 text-[#002970] flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#002970]">
                  <strong>What FSE Arjun experiences:</strong> {currentTrace.fseInsight}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Structured Data & Checksums */}
          {activeTab === 'json' && (
            <div className="bg-white rounded-xl border border-[#E4EAF2] p-4 shadow-xs flex-1 space-y-3 overflow-y-auto max-h-[510px]">
              <div>
                <h4 className="text-xs font-bold text-[#172B4D] mb-1">
                  Deterministic Validation Checks (Guardrails)
                </h4>
                <p className="text-[11px] text-[#667085] mb-2">
                  NEXA never writes unvalidated data into Paytm databases. Mathematical checks pass before committing.
                </p>

                <div className="space-y-1.5">
                  {(
                    currentTrace.validationChecks || [
                      { label: 'Merchant Identity Record', passed: true, detail: 'Verified with local phone registration' },
                      { label: 'Active GSTIN State Checksum', passed: true, detail: 'State code 29 verified against Kar. tax registry' },
                      { label: 'Address Formatting Norm', passed: true, detail: 'Line 1, City, State, PIN code all populated' },
                      { label: 'Device Eligibility Gate', passed: true, detail: 'Complies with Soundbox 4.0 rollout guidelines' },
                    ]
                  ).map((check, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded bg-[#F8F9FC] border border-[#E4EAF2] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
                        <span className="font-semibold text-[#172B4D]">{check.label}</span>
                      </div>
                      <span className="text-[11px] text-[#667085] font-mono">{check.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E4EAF2]">
                <h4 className="text-xs font-bold text-[#172B4D] mb-1">
                  Extracted JSON Payload (Ready for Core APIs)
                </h4>
                <pre className="text-[11px] font-mono bg-[#1E293B] text-[#4ADE80] p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(
                    currentTrace.observation?.jsonPayload || {
                      merchantId: 'm-001',
                      businessName: 'Raju General Stores',
                      ownerName: 'Raju Sharma',
                      phone: '9876543210',
                      gstin: '29ABCDE1234F1Z5',
                      address: {
                        line1: 'Shop 12, MG Road',
                        city: 'Bengaluru',
                        state: 'Karnataka',
                        pincode: '560001',
                      },
                      recommendedDevice: 'Paytm 4G Soundbox (dev-002)',
                      status: 'ready_for_submission',
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 3: Hardware Recommendation Matrix */}
          {activeTab === 'device' && (
            <div className="bg-white rounded-xl border border-[#E4EAF2] p-4 shadow-xs flex-1 space-y-3 overflow-y-auto max-h-[510px]">
              <div>
                <h4 className="text-xs font-bold text-[#002970] mb-0.5">
                  Algorithmic Device Selection Rationale
                </h4>
                <p className="text-[11px] text-[#667085]">
                  How NEXA determines whether to pitch a simple QR Stand, a Soundbox, or a Card POS Terminal.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg border-2 border-[#00BAF2] bg-[#EBF9FE]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#00BAF2] uppercase font-mono">SELECTED PRIMARY</span>
                    <span className="text-xs font-bold text-[#002970]">₹1,998</span>
                  </div>
                  <h5 className="text-xs font-bold text-[#002970] mt-1">QR Stand + Soundbox 4.0</h5>
                  <p className="text-[11px] text-[#344054] mt-1">
                    Ideal for grocery store with 60–70 daily transactions where counter operator cannot check screen during rush hours.
                  </p>
                  <div className="mt-2 text-[10px] space-y-0.5 text-[#007FA5]">
                    <p>• Audible payment alerts</p>
                    <p>• Instant fraud prevention</p>
                    <p>• Battery backup 7 days</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-[#E4EAF2] bg-[#F8F9FC] opacity-75">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#667085] uppercase font-mono">ALTERNATIVE</span>
                    <span className="text-xs font-bold text-[#172B4D]">₹499</span>
                  </div>
                  <h5 className="text-xs font-bold text-[#172B4D] mt-1">QR Stand Only</h5>
                  <p className="text-[11px] text-[#667085] mt-1">
                    Budget fallback if merchant rejects device price. Low margin, no voice protection.
                  </p>
                  <div className="mt-2 text-[10px] space-y-0.5 text-[#667085]">
                    <p>• Requires SMS check</p>
                    <p>• Vulnerable to fake screens</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FFFAEB] border border-[#FEDF89] text-[11px] text-[#7A4F01] space-y-1">
                <strong>Why This Beats Human Guesswork:</strong>
                <p>
                  Junior FSEs often give away free QR stands because merchants resist paying ₹1,998 upfront. NEXA automatically articulates the fraud-prevention ROI, closing the higher-margin hardware without human friction.
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: FSE & Business Impact */}
          {activeTab === 'impact' && (
            <div className="bg-white rounded-xl border border-[#E4EAF2] p-4 shadow-xs flex-1 space-y-3 overflow-y-auto max-h-[510px]">
              <div>
                <h4 className="text-xs font-bold text-[#002970] mb-0.5">
                  Measurable Impact for Paytm & FSE Arjun
                </h4>
                <p className="text-[11px] text-[#667085]">
                  Comparing traditional manual sales execution against the NEXA Autonomous Teammate.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg border border-[#FECDCA] bg-[#FEF3F2]">
                  <p className="text-[11px] font-bold text-[#B42318] uppercase font-mono">WITHOUT NEXA (OLD WAY)</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-[#912018]">
                    <li>❌ <strong>5–7 days</strong> from visit to activation</li>
                    <li>❌ <strong>80% leads drop off</strong> to PhonePe</li>
                    <li>❌ <strong>24% rejection</strong> due to manual typos</li>
                    <li>❌ FSE capped at <strong>30–40 leads</strong></li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg border border-[#A6F4C5] bg-[#ECFDF3]">
                  <p className="text-[11px] font-bold text-[#027A48] uppercase font-mono">WITH NEXA TEAMMATE</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-[#054F31]">
                    <li>✅ <strong>Under 15 minutes</strong> total cycle time</li>
                    <li>✅ <strong>Zero drop-off:</strong> instant WhatsApp follow-up</li>
                    <li>✅ <strong>&lt;2% error rate:</strong> OCR + checksums</li>
                    <li>✅ FSE handles <strong>350–400 active leads</strong></li>
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#EBF9FE] border border-[#B2E9FC] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#002970]">Total AI Cost for this Onboarding</p>
                  <p className="text-[11px] text-[#667085]">Gemini Vision OCR tokens + Twilio WhatsApp session</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-[#00BAF2]">₹1.42</span>
                  <p className="text-[10px] text-[#16845B] font-semibold">Saved ₹350 in FSE labor</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer Callout */}
          <div className="bg-white rounded-xl border border-[#E4EAF2] p-3 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16845B] animate-pulse" />
              <span className="text-xs text-[#172B4D] font-medium">
                {currentStepIndex === 5 ? (
                  <strong className="text-[#16845B]">
                    Onboarding Complete! Data ready in FSE Dashboard.
                  </strong>
                ) : (
                  <>
                    Step {currentStepIndex + 1} of 6 active · Tap <strong>Next Step</strong> or <strong>Auto-Play</strong> to progress
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentStepIndex < scenario.traces.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-3 py-1.5 bg-[#002970] hover:bg-[#001f56] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 transition-all"
                >
                  <span>Advance Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleViewInDashboard}
                  className="px-3.5 py-1.5 bg-[#00BAF2] hover:bg-[#009fd0] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <span>Review in Applications Tab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
