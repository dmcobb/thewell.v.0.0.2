

import { useState, useRef, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import {
  Scale,
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  Users,
  Compass,
  CheckCircle,
  ArrowRight,
} from "lucide-react-native"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { LinearGradient } from "expo-linear-gradient"
import { userService } from "@/lib/services/user.service"
import type { QuestionnaireResponse } from "@/lib/services/user.service"

interface EquallyYokedQuestionnaireProps {
  onComplete?: (responses: QuestionnaireResponse[]) => void | Promise<void>
}

interface EquallyYokedData {
  // Part A: Communication & Emotional Expression
  identifyFeelings: string
  expressNegativeFeelings: string
  askForNeeds: string
  avoidBelittling: string

  // Part B: Conflict & Emotional Regulation
  stayCalm: string
  winWinSolution: string
  takeResponsibility: string
  thinkBeforeAct: string

  // Part C: Affection & Affirmation
  dailyAffection: string
  buildUpPartner: string
  moreAffirming: string
  respectfulTone: string

  // Part D: Openness & Respect
  communicateNeeds: string
  discussChanges: string
  validateOpinions: string

  // Part E: Connection & Shared Meaning
  shareGoalsValues: string
  heartToHeartConversations: string

  // Part F: Personality & Lifestyle Compatibility
  introvertExtrovert: string
  adventureLevel: string
  goOutStayIn: string
  likeTravel: string
  datingOutsideRace: string
  hasChildren: string
  dateWithChildren: string
  familyMeaning: string
}

export function EquallyYokedQuestionnaire({ onComplete }: EquallyYokedQuestionnaireProps) {
  const scrollViewRef = useRef<ScrollView>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responses, setResponses] = useState<EquallyYokedData>({
    // Part A
    identifyFeelings: "",
    expressNegativeFeelings: "",
    askForNeeds: "",
    avoidBelittling: "",
    // Part B
    stayCalm: "",
    winWinSolution: "",
    takeResponsibility: "",
    thinkBeforeAct: "",
    // Part C
    dailyAffection: "",
    buildUpPartner: "",
    moreAffirming: "",
    respectfulTone: "",
    // Part D
    communicateNeeds: "",
    discussChanges: "",
    validateOpinions: "",
    // Part E
    shareGoalsValues: "",
    heartToHeartConversations: "",
    // Part F
    introvertExtrovert: "",
    adventureLevel: "",
    goOutStayIn: "",
    likeTravel: "",
    datingOutsideRace: "",
    hasChildren: "",
    dateWithChildren: "",
    familyMeaning: "",
  })

  const likertOptions = [
    { value: "1", label: "Strongly Disagree" },
    { value: "2", label: "Disagree" },
    { value: "3", label: "Neutral" },
    { value: "4", label: "Agree" },
    { value: "5", label: "Strongly Agree" },
  ]

  const sections = [
    {
      title: "Communication & Emotional Expression",
      icon: MessageCircle,
      questions: [
        {
          key: "identifyFeelings",
          question: "I identify and verbalize my feelings well.",
          type: "likert" as const,
        },
        {
          key: "expressNegativeFeelings",
          question:
            "I express negative feelings instead of keeping them in because of fear of my partner's anger or withdrawal.",
          type: "likert" as const,
        },
        {
          key: "askForNeeds",
          question: "I ask my partner for my wants and needs rather than acting out through negative behavior.",
          type: "likert" as const,
        },
        {
          key: "avoidBelittling",
          question: "In conflict, I avoid belittling my partner's communication.",
          type: "likert" as const,
        },
      ],
    },
    {
      title: "Conflict & Emotional Regulation",
      icon: Shield,
      questions: [
        {
          key: "stayCalm",
          question: "When frustrated, I stay calm and do not become easily enraged.",
          type: "likert" as const,
        },
        {
          key: "winWinSolution",
          question: "I attempt to resolve conflict in a way that creates a win-win solution.",
          type: "likert" as const,
        },
        {
          key: "takeResponsibility",
          question: "I take responsibility when mistakes or accidents happen, rather than casting blame on my partner.",
          type: "likert" as const,
        },
        {
          key: "thinkBeforeAct",
          question: "I think before I act.",
          type: "likert" as const,
        },
      ],
    },
    {
      title: "Affection & Affirmation",
      icon: Heart,
      questions: [
        {
          key: "dailyAffection",
          question: 'I convey daily genuine affection, such as saying "I love you" and showing commitment.',
          type: "likert" as const,
        },
        {
          key: "buildUpPartner",
          question: "I build my partner up with genuine compliments, rather than putting them down.",
          type: "likert" as const,
        },
        {
          key: "moreAffirming",
          question: "I am more affirming than critical in how I interact with my partner.",
          type: "likert" as const,
        },
        {
          key: "respectfulTone",
          question: "I maintain a respectful tone of voice when addressing my partner (avoiding harshness).",
          type: "likert" as const,
        },
      ],
    },
    {
      title: "Openness & Respect",
      icon: Sparkles,
      questions: [
        {
          key: "communicateNeeds",
          question: "I communicate my wants and needs to my partner, even if it may cause hurt feelings.",
          type: "likert" as const,
        },
        {
          key: "discussChanges",
          question:
            "I rationally discuss requests for changes in the relationship without fear of displeasing my partner.",
          type: "likert" as const,
        },
        {
          key: "validateOpinions",
          question: 'I validate my partner\'s opinions rather than making them feel "stupid" or unworthy.',
          type: "likert" as const,
        },
      ],
    },
    {
      title: "Connection & Shared Meaning",
      icon: Users,
      questions: [
        {
          key: "shareGoalsValues",
          question: "I share my goals, values, and beliefs with my partner.",
          type: "likert" as const,
        },
        {
          key: "heartToHeartConversations",
          question: "I engage in heart-to-heart conversations about what is going on inside me.",
          type: "likert" as const,
        },
      ],
    },
    {
      title: "Personality & Lifestyle Compatibility",
      icon: Compass,
      questions: [
        {
          key: "introvertExtrovert",
          question: "Are you an introvert or extrovert?",
          type: "choice" as const,
          options: [
            { value: "introvert", label: "Introvert" },
            { value: "ambivert", label: "Ambivert (balanced)" },
            { value: "extrovert", label: "Extrovert" },
          ],
        },
        {
          key: "adventureLevel",
          question: "What is your level of adventure?",
          type: "choice" as const,
          options: [
            { value: "low", label: "Low - Prefer routine and familiar activities" },
            { value: "medium", label: "Medium - Enjoy occasional new experiences" },
            { value: "high", label: "High - Always seeking new adventures" },
          ],
        },
        {
          key: "goOutStayIn",
          question: "Do you prefer to go out or stay in?",
          type: "choice" as const,
          options: [
            { value: "stay-in", label: "Prefer staying in" },
            { value: "balanced", label: "Balanced mix of both" },
            { value: "go-out", label: "Prefer going out" },
          ],
        },
        {
          key: "likeTravel",
          question: "Do you like to travel?",
          type: "likert" as const,
        },
        {
          key: "datingOutsideRace",
          question: "Are you open to dating outside of your race?",
          type: "choice" as const,
          options: [
            { value: "yes", label: "Yes, completely open" },
            { value: "maybe", label: "Maybe, depends on connection" },
            { value: "prefer-same", label: "Prefer same race" },
            { value: "no", label: "No" },
          ],
        },
        {
          key: "hasChildren",
          question: "Do you have children? If yes, what are their ages? Do you want more?",
          type: "choice" as const,
          options: [
            { value: "no-want-yes", label: "No children, want children" },
            { value: "no-want-no", label: "No children, don't want children" },
            { value: "no-want-maybe", label: "No children, maybe want children" },
            { value: "yes-young-want-more", label: "Yes (young children), want more" },
            { value: "yes-young-no-more", label: "Yes (young children), don't want more" },
            { value: "yes-older-want-more", label: "Yes (older children), want more" },
            { value: "yes-older-no-more", label: "Yes (older children), don't want more" },
          ],
        },
        {
          key: "dateWithChildren",
          question: "Are you willing to date someone with children? If yes, do you prefer younger or older children?",
          type: "choice" as const,
          options: [
            { value: "yes-any-age", label: "Yes, any age" },
            { value: "yes-younger", label: "Yes, prefer younger children" },
            { value: "yes-older", label: "Yes, prefer older children" },
            { value: "maybe", label: "Maybe, depends on situation" },
            { value: "no", label: "No" },
          ],
        },
        {
          key: "familyMeaning",
          question: "What does family mean to you?",
          type: "choice" as const,
          options: [
            { value: "everything", label: "Everything - top priority in life" },
            { value: "very-important", label: "Very important - central to my values" },
            { value: "important", label: "Important - but balanced with other priorities" },
            { value: "somewhat-important", label: "Somewhat important" },
            { value: "flexible", label: "Flexible definition of family" },
          ],
        },
      ],
    },
  ]

  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0)
  const answeredQuestions = Object.values(responses).filter(Boolean).length
  const progress = (answeredQuestions / totalQuestions) * 100

  const handleResponseChange = (key: keyof EquallyYokedData, value: string) => {
    setResponses((prev) => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      console.log("[Anointed Innovations] Equally Yoked Responses:", responses)

      // Transform responses to QuestionnaireResponse[] format
      const formattedResponses: QuestionnaireResponse[] = []

      sections.forEach((section, sectionIndex) => {
        const sectionLetter = String.fromCharCode(65 + sectionIndex) // A, B, C, D, E, F

        section.questions.forEach((question, questionIndex) => {
          const responseValue = responses[question.key as keyof EquallyYokedData]

          if (responseValue) {
            formattedResponses.push({
              section: `Part ${sectionLetter}: ${section.title}`,
              question_id: question.key,
              question_text: question.question,
              response_type: question.type,
              response_value: responseValue,
              response_scale: question.type === "likert" ? Number.parseInt(responseValue) : null,
            })
          }
        })
      })

      console.log("[Anointed Innovations] Submitting formatted responses:", formattedResponses)

      // Submit to backend
      const result = await userService.submitQuestionnaire(formattedResponses)

      console.log("[Anointed Innovations] Questionnaire submission result:", result)

      if (onComplete) {
        await onComplete(formattedResponses)
      }
    } catch (error) {
      console.error("[Anointed Innovations] Questionnaire submission error:", error)
      // TODO: Show error message
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentSectionData = sections[currentSection]
  const SectionIcon = currentSectionData.icon

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }, [currentSection])

  return (
    <ScrollView ref={scrollViewRef} className="flex-1" contentContainerClassName="gap-6 p-4">
      {/* Header with Progress */}
      <LinearGradient
        colors={["#0891B2", "#0284C7", "#8B5CF6", "#0369A1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-xl overflow-hidden shadow-xl"
      >
        <View className="p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Scale size={24} color="white" />
            <Text className="text-xl font-bold text-white">Equally Yoked Assessment</Text>
          </View>
          <Text className="text-sm text-white/90 mb-4">Deep spiritual compatibility for lasting love</Text>
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-white">
                Progress: {answeredQuestions} of {totalQuestions} questions
              </Text>
              <Text className="text-sm text-white">{Math.round(progress)}% complete</Text>
            </View>
            <Progress value={progress} className="h-2 bg-white/20" />
          </View>
        </View>
      </LinearGradient>

      {/* Section Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
        {sections.map((section, index) => {
          const Icon = section.icon
          const isActive = index === currentSection
          const isCompleted = section.questions.every((q) => responses[q.key as keyof EquallyYokedData])

          let buttonStyle = "flex-row items-center gap-2 px-3 py-2 rounded-lg "
          if (isActive) {
            buttonStyle += "bg-purple-500"
          } else if (isCompleted) {
            buttonStyle += "bg-purple-50 border border-purple-200"
          } else {
            buttonStyle += "bg-white border border-slate-200"
          }

          let textStyle = "text-sm font-medium "
          if (isActive) {
            textStyle += "text-white"
          } else if (isCompleted) {
            textStyle += "text-purple-500"
          } else {
            textStyle += "text-slate-500"
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentSection(index)}
              className={buttonStyle}
              activeOpacity={0.7}
            >
              <Icon size={16} color={isActive ? "white" : isCompleted ? "#8B5CF6" : "#64748B"} />
              <Text className={textStyle}>{section.title}</Text>
              {isCompleted && <CheckCircle size={12} color={isActive ? "white" : "#8B5CF6"} />}
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Current Section */}
      <Card>
        <CardHeader>
          <View className="flex-row items-center gap-2 mb-1">
            <SectionIcon size={20} color="#8B5CF6" />
            <CardTitle className="text-purple-500">{currentSectionData.title}</CardTitle>
          </View>
          <Text className="text-sm text-slate-600">
            Part {String.fromCharCode(65 + currentSection)} • Section {currentSection + 1} of {sections.length}
          </Text>
        </CardHeader>
        <CardContent className="gap-8">
          {currentSectionData.questions.map((question, qIndex) => (
            <View key={question.key} className="gap-4">
              <View className="bg-purple-50 p-4 rounded-xl border border-purple-200/50">
                <Text className="font-medium text-purple-500 mb-3">
                  {qIndex + 1}. {question.question}
                </Text>
                <RadioGroup
                  value={responses[question.key as keyof EquallyYokedData]}
                  onValueChange={(value) => handleResponseChange(question.key as keyof EquallyYokedData, value)}
                  className="gap-3"
                >
                  {(question.type === "likert" ? likertOptions : question.options || []).map((option) => (
                    <View
                      key={option.value}
                      className="flex-row items-start gap-3 p-3 bg-white/80 rounded-lg active:bg-white"
                    >
                      <RadioGroupItem value={option.value} id={`${question.key}-${option.value}`} />
                      <Label className="flex-1 text-sm leading-relaxed">{option.label}</Label>
                    </View>
                  ))}
                </RadioGroup>
              </View>
            </View>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <View className="flex-row gap-3">
        <Button
          onPress={handlePrevious}
          disabled={currentSection === 0}
          variant="outline"
          className="flex-1 h-12 bg-white"
        >
          <Text className="text-purple-500 font-medium">Previous Section</Text>
        </Button>

        {currentSection === sections.length - 1 ? (
          <Button
            onPress={handleSubmit}
            disabled={answeredQuestions < totalQuestions || isSubmitting}
            className="flex-1 h-12 bg-purple-500"
          >
            <View className="flex-row items-center gap-2">
              <CheckCircle size={16} color="white" />
              <Text className="text-white font-medium">{isSubmitting ? "Submitting..." : "Complete Assessment"}</Text>
            </View>
          </Button>
        ) : (
          <Button onPress={handleNext} className="flex-1 h-12 bg-white border border-purple-200">
            <View className="flex-row items-center gap-2">
              <Text className="text-purple-500 font-medium">Next Section</Text>
              <ArrowRight size={16} color="#8B5CF6" />
            </View>
          </Button>
        )}
      </View>

      {/* AI Integration Info */}
      <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <View className="flex-row gap-3">
          <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center">
            <Scale size={16} color="white" />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-purple-500 mb-1">How This Helps Your Matches</Text>
            <Text className="text-sm text-slate-600 leading-relaxed mb-3">
              Your responses create a detailed compatibility profile that our AI uses to find partners who share your
              communication style, values, and life approach for a truly equally yoked relationship.
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <Badge variant="outline" className="border-purple-200 bg-white/80">
                <Text className="text-xs text-purple-500">Communication Compatibility</Text>
              </Badge>
              <Badge variant="outline" className="border-purple-200 bg-white/80">
                <Text className="text-xs text-purple-500">Lifestyle Alignment</Text>
              </Badge>
              <Badge variant="outline" className="border-purple-200 bg-white/80">
                <Text className="text-xs text-purple-500">Relationship Values</Text>
              </Badge>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}