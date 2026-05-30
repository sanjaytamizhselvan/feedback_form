import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import schema from "./validationSchema";
import { submitToGoogle } from "./submitToGoogle";
import { useState } from "react";
import { uploadFilesToDrive } from "./uploadToGoogleDrive";
import { toast } from "../components/ui/use-toast";

const useEnrollmentForm = (setStep) => {
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      // Step 1
      fullName: "",
      mobileNumber: "",
      collegeName: "",
      department: "",
      startDate: "",
      endDate: "",
      mode: "",
      // Step 2
      projects: "",
      roles: "",
      technologies: [],
      otherTech: "",
      support: "",
      rating: 0,
      // Step 3
      mentorAccessibility: "",
      feedback: "",
      mentorRating: 0,
      communicationRating: 0,
      responseTime: "",
      supportRating: 0,
      regularFeedback: "",
      doubtResolution: "",
      // Step 4
      ideaCommunication: "",
      teamFeeling: "",
      teamCoordination: 0,
      practicalKnowledge: "",
      learningRating: 0,
      skills: [],
      careerAlignment: "",
      // Step 5
      internshipStructure: 0,
      deadlines: "",
      projectGoals: "",
      github: "",
      taskClarity: "",
      taskMeaningful: 0,
      challenges: "",
      // Step 6
      takeaway: "",
      challengesOvercome: "",
      improvements: "",
      joinFuture: "",
      recommend: "",
      source: [],
      otherSource: "",
      postedPlatform: [],
      otherPostedPlatform: "",
      environment: 0,
      comfortable: "",
      teamwork: "",
      // Step 7
      handover: "",
      knowledgeShare: "",
      certificate: "",
      generalSuggestions: "",
      enjoyment: 0,
      overallExperience: 0,
      likedMost: "",
      improveMore: "",
      // Step 8
      finalDocuments: [],
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const fullName = data.fullName;

      // ── Upload final documents (Step 8) ──────────────────
      if (Array.isArray(data.finalDocuments) && data.finalDocuments.length > 0) {
        const docsUpload = await uploadFilesToDrive(
          data.finalDocuments,
          fullName,
          null // creates a new folder named after the intern
        );
        // Store Drive links so the Apps Script can write them to the sheet
        data.finalDocumentLinks = docsUpload?.links || [];
        // Remove the raw File objects (not serialisable)
        delete data.finalDocuments;
      }

      // ── Submit all text data to Google Sheets ────────────
      await submitToGoogle(data);

      toast({
        title: "Submission successful",
        description: "Your feedback has been submitted. Thank you!",
        variant: "success",
        duration: 3000,
      });

      // Navigate to the success screen (step 10 = after 9 form steps)
      setStep(10);
    } catch (err) {
      console.error("Submission error:", err);
      toast({
        title: "Submission failed",
        description: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ...methods,
    onSubmit,
    showErrors,
    setShowErrors,
    isSubmitting,
  };
};

export default useEnrollmentForm;
