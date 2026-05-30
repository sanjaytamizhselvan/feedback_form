import React from "react";
import { useFormContext } from "react-hook-form";
import { useFormUI } from "../context/FormUIContext";
import { CheckCircle } from "lucide-react";

// Phase cycling while submitting (copied from Step 8 logic for consistency if needed, 
// but Step 9 is where the actual submit action now lives)
const PHASES = [
  { key: "uploading", label: "Uploading your documents",  sub: "Saving files to Drive…"          },
  { key: "saving",    label: "Saving your responses",     sub: "Writing data to the sheet…"      },
  { key: "done",      label: "All done!",                 sub: "Redirecting you in a moment…"    },
];

const Step9TC = ({ onNext, shake, isSubmitting }) => {
  const {
    register,
    watch,
    formState: { errors },
    clearErrors,
  } = useFormContext();
  const { showErrors } = useFormUI();

  const agreed = watch("agreedToTerms");

  // Track whether the user has clicked Submit so the overlay appears
  // immediately, before isSubmitting becomes true in the parent.
  const [clicked, setClicked] = React.useState(false);
  const [phaseIdx, setPhaseIdx] = React.useState(0);
  const phaseTimer = React.useRef(null);
  const prevSubmitting = React.useRef(false);

  // Show overlay whenever clicked OR parent is actively submitting
  const busy = clicked || isSubmitting;

  React.useEffect(() => {
    // ── Submission just started ─────────────────────────────
    if (isSubmitting && !prevSubmitting.current) {
      prevSubmitting.current = true;
      setPhaseIdx(0);
      let idx = 0;
      clearInterval(phaseTimer.current);
      phaseTimer.current = setInterval(() => {
        idx = Math.min(idx + 1, PHASES.length - 2); // cycle between phase 0 → 1
        setPhaseIdx(idx);
      }, 2200);
    }

    // ── Submission just finished ────────────────────────────
    if (!isSubmitting && prevSubmitting.current) {
      prevSubmitting.current = false;
      clearInterval(phaseTimer.current);
      // Flash "All done!" briefly; parent will navigate to step 10
      setPhaseIdx(PHASES.length - 1);
      setTimeout(() => {
        setClicked(false);
        setPhaseIdx(0);
      }, 900);
    }

    return () => clearInterval(phaseTimer.current);
  }, [isSubmitting]);

  const handleSubmitClick = () => {
    if (clicked || isSubmitting || !agreed) return;
    setClicked(true); // show overlay immediately while parent async starts
    onNext();
  };

  const currentPhase = PHASES[phaseIdx];
  const isDone = phaseIdx === PHASES.length - 1;

  return (
    <div className="min-h-screen bg-[#000001] text-white overflow-x-hidden relative">
      
      {/* ── LOADING OVERLAY ───────────────────────────────── */}
      {busy && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md">
          <div className="relative flex items-center justify-center mb-7">
            {isDone ? (
              <CheckCircle size={72} className="text-green-400 animate-[scPop_0.35s_cubic-bezier(.175,.885,.32,1.275)_both]" />
            ) : (
              <>
                <div className="w-[72px] h-[72px] rounded-full border-4 border-[#2a2a2a]" />
                <svg className="absolute w-[72px] h-[72px] animate-spin" viewBox="0 0 72 72" fill="none">
                  <circle cx="36" cy="36" r="32" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="60 140" />
                </svg>
                <div className="absolute w-3 h-3 rounded-full bg-white animate-pulse" />
              </>
            )}
          </div>
          <p className="text-white text-[17px] font-semibold tracking-wide text-center animate-[scFadeUp_0.3s_ease_both]">
            {currentPhase.label}
          </p>
          <p className="text-gray-400 text-sm mt-1.5 text-center animate-[scFadeUp_0.3s_ease_0.05s_both]">
            {isDone ? currentPhase.sub : <>{currentPhase.sub}<AnimatedDots /></>}
          </p>
          {!isDone && (
            <div className="mt-8 w-48 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700 ease-out" style={{ width: phaseIdx === 0 ? "40%" : "80%" }} />
            </div>
          )}
          {!isDone && <p className="text-[#555] text-xs mt-5">Please don't close or refresh this page</p>}
        </div>
      )}

      {/* ── PAGE CONTENT ──────────────────────────────────── */}
      <div className="max-w-3xl mx-auto p-6 sm:p-8">
        
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

        <div className={`bg-[#1a1a1a] rounded-md shadow-lg relative ${shake ? "shake" : ""}`}>
          
          <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
            
            <section>
              <h2 className="text-xl font-semibold mb-2">Declaration of Accuracy</h2>
              <p className="text-gray-300">
                By submitting this Internship Feedback & Exit Form, I acknowledge and agree to the following:
              </p>
              <ul className="list-disc ml-5 text-gray-300 space-y-1 mt-2">
                <li>The information, feedback, reports, documents, and responses submitted by me are true and accurate to the best of my knowledge.</li>
              </ul>
            </section>

            <hr className="border-gray-700" />

            <section>
              <h2 className="text-xl font-semibold mb-2">Certification & Approvals</h2>
              <p className="text-gray-300">
                I understand that submission of this form does not automatically guarantee issuance of:
              </p>
              <ul className="list-disc ml-5 text-gray-300 space-y-1 mt-2">
                <li>Internship certificate</li>
                <li>Recommendation letter</li>
                <li>Experience letter</li>
                <li>Completion approval</li>
                <li>Future opportunity</li>
              </ul>
            </section>

            <hr className="border-gray-700" />

            <section>
              <h2 className="text-xl font-semibold mb-2">Requirements Completion</h2>
              <p className="text-gray-300">
                I confirm that I have completed or submitted all applicable internship requirements including:
              </p>
              <ul className="list-disc ml-5 text-gray-300 space-y-1 mt-2">
                <li>Assigned reports and documentation</li>
                <li>GitHub/repository updates</li>
                <li>Project submissions and handover details</li>
                <li>Final presentation/demo where applicable</li>
              </ul>
            </section>

            <hr className="border-gray-700" />

            <section>
              <h2 className="text-xl font-semibold mb-2">Intellectual Property</h2>
              <p className="text-gray-300">
                I acknowledge that any project files, source code, reports, presentations, workflows, datasets, documentation, or materials developed during the internship remain the intellectual property of Shine Craft Technologies unless otherwise agreed in writing.
              </p>
            </section>

            <hr className="border-gray-700" />

            <section>
              <h2 className="text-xl font-semibold mb-2">Confidentiality</h2>
              <ul className="list-disc ml-5 text-gray-300 space-y-1 mt-2">
                <li>I confirm that I have not knowingly retained unauthorized confidential information, credentials, source code, internal documents, or Company resources after internship completion.</li>
                <li>I acknowledge that confidentiality, intellectual property, and data protection obligations continue even after completion of the internship.</li>
              </ul>
            </section>

            <hr className="border-gray-700" />

            <section>
              <h2 className="text-xl font-semibold mb-2">Company Review Process</h2>
              <p className="text-gray-300">
                I understand that the Company may review my performance across several areas before approving completion status or issuing certificates:
              </p>
              <ul className="list-disc ml-5 text-gray-300 space-y-1 mt-2">
                <li>Attendance and reporting consistency</li>
                <li>Communication and project contribution</li>
                <li>Documentation and policy compliance</li>
                <li>Handover completion</li>
              </ul>
            </section>

            <hr className="border-gray-700" />

            <section>
              <h2 className="text-xl font-semibold mb-2">Data Usage & Authorization</h2>
              <p className="text-gray-300">
                I authorize Shine Craft Technologies to use submitted feedback, ratings, testimonials, suggestions, project summaries, or internship experience inputs for:
              </p>
              <ul className="list-disc ml-5 text-gray-300 space-y-1 mt-2">
                <li>Internal evaluation and quality improvement</li>
                <li>Academic coordination and operational analysis</li>
                <li>Internship program enhancement</li>
                <li>Anonymized reporting and promotional/testimonial purposes where applicable</li>
              </ul>
            </section>

            <hr className="border-gray-700" />

            <section>
              <h2 className="text-xl font-semibold mb-2">External Coordination</h2>
              <p className="text-gray-300">
                I understand that the Company may coordinate with my educational institution regarding internship completion, participation status, attendance, or academic reporting requirements where applicable.
              </p>
            </section>

            <hr className="border-gray-700" />

            <section>
              <h2 className="text-xl font-semibold mb-2">Final Confirmation</h2>
              <p className="text-gray-300">
                I confirm that all uploaded files and submissions are appropriate, relevant, and authorized for submission. By submitting this form, I confirm that I have read, understood, and agreed to the above declaration and consent terms.
              </p>
            </section>

            {/* ACCEPTANCE CHECKBOX */}
            <div className="mt-8">
              <div className={`bg-black/20 rounded-lg border border-gray-800 p-4 flex items-center gap-3 transition-colors ${!agreed && showErrors ? "border-red-400/50" : ""}`}>
                <input
                  type="checkbox"
                  id="tc-agree"
                  className="w-5 h-5 accent-white cursor-pointer"
                  {...register("agreedToTerms", {
                    onChange: () => clearErrors("agreedToTerms")
                  })}
                />
                <label htmlFor="tc-agree" className="text-gray-200 font-medium cursor-pointer select-none">
                  I have read and agree to all the Terms and Conditions
                </label>
              </div>
              {showErrors && errors.agreedToTerms && (
                <p className="mt-2 text-sm text-red-400">
                  * {errors.agreedToTerms.message}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={busy}
            className={`px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 flex items-center justify-center gap-3 min-w-[160px] ${
              !agreed || busy
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-100 active:scale-[0.98] shadow-md"
            }`}
          >
            {busy ? (
              <>
                <svg className="w-[18px] h-[18px] animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#3a3a3a" strokeWidth="2.5" />
                  <path d="M12 2 a10 10 0 0 1 10 10" stroke="#666" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Processing…
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>

      </div>

      <style>{`
        @keyframes scPop     { from{opacity:0;transform:scale(.5)} to{opacity:1;transform:scale(1)} }
        @keyframes scFadeUp  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scDot     { 0%,80%,100%{transform:scale(0);opacity:0} 40%{transform:scale(1);opacity:1} }
        .shake { animation: shake 0.35s ease-in-out; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

const AnimatedDots = () => (
  <span className="inline-flex gap-[3px] ml-1 align-middle">
    {[0, 1, 2].map((i) => (
      <span key={i} className="w-[4px] h-[4px] rounded-full bg-gray-400 inline-block animate-[scDot_1.2s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.18}s` }} />
    ))}
  </span>
);

export default Step9TC;