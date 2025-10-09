import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import {
  Scale,
  Heart,
  BookOpen,
  Church,
  Users,
  DollarSign,
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

interface EquallyYokedData {
  salvationExperience: string
  bibleStudyFrequency: string
  prayerLife: string
  churchPriority: string
  spiritualGrowth: string
  marriageView: string
  financialStewardship: string
  serviceHeart: string
  characterFruit: string
  lifeCallingPriority: string
  denominationalFlexibility: string
  leadershipRoles: string
  evangelismComfort: string
  holySpirit: string
  endTimes: string
  socialJustice: string
  familyWorship: string
  sabbathObservance: string
  alcoholTobacco: string
  mediaConsumption: string
}

export function EquallyYokedQuestionnaire() {
  const [currentSection, setCurrentSection] = useState(0)
  const [responses, setResponses] = useState<EquallyYokedData>({
    salvationExperience: "",
    bibleStudyFrequency: "",
    prayerLife: "",
    churchPriority: "",
    spiritualGrowth: "",
    marriageView: "",
    financialStewardship: "",
    serviceHeart: "",
    characterFruit: "",
    lifeCallingPriority: "",
    denominationalFlexibility: "",
    leadershipRoles: "",
    evangelismComfort: "",
    holySpirit: "",
    endTimes: "",
    socialJustice: "",
    familyWorship: "",
    sabbathObservance: "",
    alcoholTobacco: "",
    mediaConsumption: "",
  })

  const sections = [
    {
      title: "Foundation of Faith",
      icon: Heart,
      questions: [
        {
          key: "salvationExperience",
          question: "How would you describe your salvation experience?",
          options: [
            { value: "born-again", label: "Born again believer with clear testimony" },
            { value: "lifelong-faith", label: "Raised in faith, gradual understanding" },
            { value: "recent-conversion", label: "Recent conversion experience" },
            { value: "questioning", label: "Still exploring and questioning" },
            { value: "cultural-christian", label: "Cultural Christian background" },
          ],
        },
        {
          key: "bibleStudyFrequency",
          question: "How often do you engage in personal Bible study?",
          options: [
            { value: "daily", label: "Daily personal study and meditation" },
            { value: "several-weekly", label: "Several times per week" },
            { value: "weekly", label: "Weekly, usually with church or group" },
            { value: "occasionally", label: "Occasionally, when inspired" },
            { value: "rarely", label: "Rarely, mostly during church services" },
          ],
        },
        {
          key: "prayerLife",
          question: "Describe your personal prayer life:",
          options: [
            { value: "constant-communion", label: "Constant communion throughout the day" },
            { value: "structured-daily", label: "Structured daily prayer times" },
            { value: "regular-informal", label: "Regular but informal prayers" },
            { value: "situational", label: "Mainly during challenges or meals" },
            { value: "minimal", label: "Minimal personal prayer time" },
          ],
        },
      ],
    },
    {
      title: "Church & Community",
      icon: Church,
      questions: [
        {
          key: "churchPriority",
          question: "How important is regular church attendance to you?",
          options: [
            { value: "essential", label: "Essential - never miss unless sick" },
            { value: "very-important", label: "Very important - attend most Sundays" },
            { value: "important", label: "Important - attend regularly but flexible" },
            { value: "somewhat", label: "Somewhat important - attend when convenient" },
            { value: "not-priority", label: "Not a high priority in my life" },
          ],
        },
        {
          key: "serviceHeart",
          question: "How do you serve in your church community?",
          options: [
            { value: "multiple-ministries", label: "Active in multiple ministries/leadership" },
            { value: "regular-volunteer", label: "Regular volunteer in specific ministry" },
            { value: "occasional-helper", label: "Occasional helper when asked" },
            { value: "financial-only", label: "Primarily through financial giving" },
            { value: "not-involved", label: "Not currently involved in service" },
          ],
        },
        {
          key: "denominationalFlexibility",
          question: "How important is denominational alignment?",
          options: [
            { value: "very-specific", label: "Must share exact denominational beliefs" },
            { value: "similar-tradition", label: "Similar theological tradition preferred" },
            { value: "core-beliefs", label: "Core Christian beliefs more important" },
            { value: "very-flexible", label: "Very flexible on denominational differences" },
            { value: "non-denominational", label: "Prefer non-denominational approach" },
          ],
        },
      ],
    },
    {
      title: "Spiritual Growth",
      icon: BookOpen,
      questions: [
        {
          key: "spiritualGrowth",
          question: "How do you pursue spiritual growth?",
          options: [
            { value: "intensive-study", label: "Intensive Bible study, theology, discipleship" },
            { value: "regular-learning", label: "Regular sermons, books, Christian content" },
            { value: "group-focused", label: "Primarily through small groups/community" },
            { value: "personal-reflection", label: "Personal reflection and life experience" },
            { value: "minimal-effort", label: "Minimal intentional growth efforts" },
          ],
        },
        {
          key: "leadershipRoles",
          question: "What's your comfort level with spiritual leadership?",
          options: [
            { value: "natural-leader", label: "Natural leader, comfortable teaching/leading" },
            { value: "willing-when-called", label: "Willing to lead when called upon" },
            { value: "prefer-supporting", label: "Prefer supporting roles behind the scenes" },
            { value: "still-learning", label: "Still learning, not ready to lead others" },
            { value: "uncomfortable", label: "Uncomfortable with leadership expectations" },
          ],
        },
        {
          key: "evangelismComfort",
          question: "How comfortable are you sharing your faith?",
          options: [
            { value: "passionate-evangelist", label: "Passionate evangelist, actively share faith" },
            { value: "comfortable-when-asked", label: "Comfortable when opportunities arise" },
            { value: "close-relationships", label: "Share mainly with close relationships" },
            { value: "lifestyle-witness", label: "Prefer to witness through lifestyle" },
            { value: "very-private", label: "Keep faith very private and personal" },
          ],
        },
      ],
    },
    {
      title: "Marriage & Family",
      icon: Users,
      questions: [
        {
          key: "marriageView",
          question: "What's your view on Christian marriage?",
          options: [
            { value: "covenant-sacred", label: "Sacred covenant, lifelong commitment" },
            { value: "biblical-roles", label: "Biblical roles with mutual submission" },
            { value: "equal-partnership", label: "Equal partnership under God" },
            { value: "practical-commitment", label: "Practical commitment with faith foundation" },
            { value: "flexible-modern", label: "Flexible, modern approach to marriage" },
          ],
        },
        {
          key: "familyWorship",
          question: "How important is family worship/devotions?",
          options: [
            { value: "daily-priority", label: "Daily family devotions are essential" },
            { value: "regular-practice", label: "Regular family prayer and Bible reading" },
            { value: "weekly-together", label: "Weekly family worship times" },
            { value: "church-focused", label: "Mainly worship together at church" },
            { value: "individual-faith", label: "Prefer individual faith practices" },
          ],
        },
        {
          key: "characterFruit",
          question: "Which spiritual fruits do you most value in a partner?",
          options: [
            { value: "love-joy-peace", label: "Love, joy, and peace above all" },
            { value: "patience-kindness", label: "Patience and kindness in daily life" },
            { value: "faithfulness-gentleness", label: "Faithfulness and gentleness" },
            { value: "self-control", label: "Self-control and discipline" },
            { value: "all-equally", label: "All fruits of the Spirit equally" },
          ],
        },
      ],
    },
    {
      title: "Life Stewardship",
      icon: DollarSign,
      questions: [
        {
          key: "financialStewardship",
          question: "How do you approach financial stewardship?",
          options: [
            { value: "tithing-plus", label: "Faithful tithing plus generous giving" },
            { value: "consistent-tithing", label: "Consistent 10% tithing to church" },
            { value: "regular-giving", label: "Regular giving as able, not strict 10%" },
            { value: "occasional-giving", label: "Occasional giving to church/causes" },
            { value: "minimal-giving", label: "Minimal giving due to circumstances" },
          ],
        },
        {
          key: "lifeCallingPriority",
          question: "How important is discovering God's calling for your life?",
          options: [
            { value: "central-focus", label: "Central focus, actively seeking God's will" },
            { value: "important-consideration", label: "Important consideration in major decisions" },
            { value: "general-guidance", label: "Seek general guidance, not specific calling" },
            { value: "practical-decisions", label: "Make practical decisions, trust God's sovereignty" },
            { value: "not-concerned", label: "Not particularly concerned with specific calling" },
          ],
        },
        {
          key: "socialJustice",
          question: "How do you view Christian involvement in social justice?",
          options: [
            { value: "gospel-mandate", label: "Gospel mandate to fight injustice actively" },
            { value: "important-calling", label: "Important calling for many Christians" },
            { value: "individual-choice", label: "Individual choice based on gifts/calling" },
            { value: "focus-evangelism", label: "Focus should be on evangelism first" },
            { value: "avoid-politics", label: "Avoid mixing faith with political issues" },
          ],
        },
      ],
    },
    {
      title: "Lifestyle & Values",
      icon: Compass,
      questions: [
        {
          key: "sabbathObservance",
          question: "How do you observe the Sabbath/Lord's Day?",
          options: [
            { value: "strict-rest", label: "Strict rest, worship, and family time" },
            { value: "church-family", label: "Church attendance and family focus" },
            { value: "flexible-rest", label: "Flexible rest and spiritual activities" },
            { value: "normal-day", label: "Mostly normal day with church attendance" },
            { value: "no-distinction", label: "No particular distinction from other days" },
          ],
        },
        {
          key: "alcoholTobacco",
          question: "What's your stance on alcohol and tobacco?",
          options: [
            { value: "complete-abstinence", label: "Complete abstinence from both" },
            { value: "no-tobacco-moderate-alcohol", label: "No tobacco, moderate alcohol occasionally" },
            { value: "social-drinking", label: "Social drinking acceptable, no tobacco" },
            { value: "personal-choice", label: "Personal choice, moderation in all things" },
            { value: "no-strong-opinion", label: "No strong opinion either way" },
          ],
        },
        {
          key: "mediaConsumption",
          question: "How do you approach entertainment and media?",
          options: [
            { value: "strictly-christian", label: "Strictly Christian/family-friendly content" },
            { value: "careful-selection", label: "Careful selection based on values" },
            { value: "mainstream-discerning", label: "Mainstream content with discernment" },
            { value: "personal-enjoyment", label: "Personal enjoyment with few restrictions" },
            { value: "no-restrictions", label: "No particular restrictions based on faith" },
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

  const handleSubmit = () => {
    console.log("Equally Yoked Responses:", responses)
    // Show success message
  }

  const currentSectionData = sections[currentSection]
  const SectionIcon = currentSectionData.icon

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-6 p-4">
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

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentSection(index)}
              className={`flex-row items-center gap-2 px-3 py-2 rounded-lg ${
                isActive
                  ? "bg-gradient-to-r from-primary via-secondary to-primary-light"
                  : isCompleted
                    ? "bg-purple-50 border border-purple-200"
                    : "bg-white border border-slate-200"
              }`}
              activeOpacity={0.7}
            >
              <Icon size={16} color={isActive ? "white" : isCompleted ? "#8B5CF6" : "#64748B"} />
              <Text
                className={`text-sm font-medium ${isActive ? "text-white" : isCompleted ? "text-purple-500" : "text-slate-500"}`}
              >
                {section.title}
              </Text>
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
            Section {currentSection + 1} of {sections.length}
          </Text>
        </CardHeader>
        <CardContent className="gap-8">
          {currentSectionData.questions.map((question, qIndex) => (
            <View key={question.key} className="gap-4">
              <View className="bg-gradient-to-r from-ocean-50 via-purple-50 to-ocean-100 p-4 rounded-xl border border-purple-200/50">
                <Text className="font-medium text-purple-500 mb-3">
                  {qIndex + 1}. {question.question}
                </Text>
                <RadioGroup
                  value={responses[question.key as keyof EquallyYokedData]}
                  onValueChange={(value) => handleResponseChange(question.key as keyof EquallyYokedData, value)}
                  className="gap-3"
                >
                  {question.options.map((option) => (
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
            disabled={answeredQuestions < totalQuestions}
            className="flex-1 h-12 bg-gradient-to-r from-primary via-secondary to-primary-light"
          >
            <View className="flex-row items-center gap-2">
              <CheckCircle size={16} color="white" />
              <Text className="text-white font-medium">Complete Assessment</Text>
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
      <View className="bg-gradient-to-r from-ocean-50 via-purple-50 to-ocean-100 border border-purple-200/50 rounded-xl p-4">
        <View className="flex-row gap-3">
          <View className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-full items-center justify-center">
            <Scale size={16} color="white" />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-purple-500 mb-1">How This Helps Your Matches</Text>
            <Text className="text-sm text-slate-600 leading-relaxed mb-3">
              Your responses create a detailed spiritual compatibility profile that our AI uses to find partners who
              share your depth of faith, values, and life approach.
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <Badge variant="outline" className="border-purple-200 bg-white/80">
                <Text className="text-xs text-purple-500">Faith Depth Analysis</Text>
              </Badge>
              <Badge variant="outline" className="border-purple-200 bg-white/80">
                <Text className="text-xs text-purple-500">Lifestyle Compatibility</Text>
              </Badge>
              <Badge variant="outline" className="border-purple-200 bg-white/80">
                <Text className="text-xs text-purple-500">Spiritual Growth Alignment</Text>
              </Badge>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
