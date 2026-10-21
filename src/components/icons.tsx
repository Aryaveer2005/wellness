// Premium icon set for EaseMind — Phosphor Icons (duotone by default).
// Always import icons from "@/components/icons", never from lucide-react.
// Need another icon? Add it to this list: https://phosphoricons.com
import { forwardRef } from "react";
import type { Icon, IconProps } from "@phosphor-icons/react";
import {
  House as PhHouse,
  Sparkle as PhSparkle,
  Brain as PhBrain,
  ChatCircleDots as PhChatCircleDots,
  ChatsCircle as PhChatsCircle,
  Stethoscope as PhStethoscope,
  ChartLineUp as PhChartLineUp,
  GearSix as PhGearSix,
  Info as PhInfo,
  Lifebuoy as PhLifebuoy,
  MoonStars as PhMoonStars,
  Sun as PhSun,
  CaretDown as PhCaretDown,
  CaretRight as PhCaretRight,
  CaretUp as PhCaretUp,
  CaretLeft as PhCaretLeft,
  ArrowLeft as PhArrowLeft,
  ArrowRight as PhArrowRight,
  ArrowUp as PhArrowUp,
  ArrowUpRight as PhArrowUpRight,
  Check as PhCheck,
  CheckCircle as PhCheckCircle,
  SealCheck as PhSealCheck,
  Briefcase as PhBriefcase,
  CalendarDots as PhCalendarDots,
  Coffee as PhCoffee,
  DownloadSimple as PhDownloadSimple,
  Ear as PhEar,
  ArrowSquareOut as PhArrowSquareOut,
  Eye as PhEye,
  Flower as PhFlower,
  SmileySad as PhSmileySad,
  SmileyMeh as PhSmileyMeh,
  Smiley as PhSmiley,
  SmileyWink as PhSmileyWink,
  SmileyNervous as PhSmileyNervous,
  HandWaving as PhHandWaving,
  Heart as PhHeart,
  Handshake as PhHandshake,
  ClockCounterClockwise as PhClockCounterClockwise,
  Translate as PhTranslate,
  Lightbulb as PhLightbulb,
  CircleNotch as PhCircleNotch,
  LockSimple as PhLockSimple,
  SignIn as PhSignIn,
  SignOut as PhSignOut,
  EnvelopeSimple as PhEnvelopeSimple,
  MapPin as PhMapPin,
  MapTrifold as PhMapTrifold,
  Monitor as PhMonitor,
  Devices as PhDevices,
  DotsThree as PhDotsThree,
  Confetti as PhConfetti,
  Pause as PhPause,
  Play as PhPlay,
  Phone as PhPhone,
  PhoneCall as PhPhoneCall,
  Plus as PhPlus,
  PresentationChart as PhPresentationChart,
  ArrowCounterClockwise as PhArrowCounterClockwise,
  MagnifyingGlass as PhMagnifyingGlass,
  ShieldWarning as PhShieldWarning,
  ShieldCheck as PhShieldCheck,
  SkipForward as PhSkipForward,
  DeviceMobile as PhDeviceMobile,
  Timer as PhTimer,
  TrendUp as PhTrendUp,
  TrendDown as PhTrendDown,
  Trash as PhTrash,
  UsersThree as PhUsersThree,
  Wallet as PhWallet,
  X as PhX,
  Lightning as PhLightning,
  Star as PhStar,
  NavigationArrow as PhNavigationArrow,
  Clock as PhClock,
  Globe as PhGlobe,
  Quotes as PhQuotes,
  Wind as PhWind,
  Mountains as PhMountains,
  Target as PhTarget,
  Feather as PhFeather,
  Compass as PhCompass,
  Leaf as PhLeaf,
  PaperPlaneRight as PhPaperPlaneRight,
  Waveform as PhWaveform,
  Butterfly as PhButterfly,
  Fingerprint as PhFingerprint,
  FlowerLotus as PhFlowerLotus,
  Warning as PhWarning,
  WarningOctagon as PhWarningOctagon,
  XCircle as PhXCircle,
  Microphone as PhMicrophone,
  Crosshair as PhCrosshair,
  Sliders as PhSliders,
  Funnel as PhFunnel,
  UserCircle as PhUserCircle,
  Medal as PhMedal,
  Path as PhPath,
  Moon as PhMoon,
  HeartHalf as PhHeartHalf,
  Atom as PhAtom,
  Drop as PhDrop,
  Gauge as PhGauge,
  Notebook as PhNotebook,
  NotePencil as PhNotePencil,
  PersonSimpleTaiChi as PhPersonSimpleTaiChi,
  SpeakerHigh as PhSpeakerHigh,
  Hand as PhHand,
  HandHeart as PhHandHeart,
  Palette as PhPalette,
  Scales as PhScales,
  FileText as PhFileText,
  CloudSlash as PhCloudSlash,
  MagnifyingGlassMinus as PhMagnifyingGlassMinus,
  ArrowDown as PhArrowDown,
} from "@phosphor-icons/react/ssr";

export type { IconProps };
export type AppIcon = Icon;

/** Wraps a Phosphor icon so it defaults to the duotone weight. */
export function duo(PhIcon: Icon): Icon {
  const Wrapped = forwardRef<SVGSVGElement, IconProps>(function DuoIcon(props, ref) {
    return <PhIcon ref={ref} weight="duotone" {...props} />;
  });
  Wrapped.displayName = PhIcon.displayName;
  return Wrapped as Icon;
}

export const House = duo(PhHouse);
export const Hand = duo(PhHand);
export const HandHeart = duo(PhHandHeart);
export const Palette = duo(PhPalette);
export const Scales = duo(PhScales);
export const FileText = duo(PhFileText);
export const Sparkle = duo(PhSparkle);
export const Brain = duo(PhBrain);
export const ChatCircleDots = duo(PhChatCircleDots);
export const ChatsCircle = duo(PhChatsCircle);
export const Stethoscope = duo(PhStethoscope);
export const ChartLineUp = duo(PhChartLineUp);
export const GearSix = duo(PhGearSix);
export const Info = duo(PhInfo);
export const Lifebuoy = duo(PhLifebuoy);
export const MoonStars = duo(PhMoonStars);
export const Sun = duo(PhSun);
export const CaretDown = duo(PhCaretDown);
export const CaretRight = duo(PhCaretRight);
export const CaretUp = duo(PhCaretUp);
export const CaretLeft = duo(PhCaretLeft);
export const ArrowLeft = duo(PhArrowLeft);
export const ArrowRight = duo(PhArrowRight);
export const ArrowUp = duo(PhArrowUp);
export const ArrowUpRight = duo(PhArrowUpRight);
export const Check = duo(PhCheck);
export const CheckCircle = duo(PhCheckCircle);
export const SealCheck = duo(PhSealCheck);
export const Briefcase = duo(PhBriefcase);
export const CalendarDots = duo(PhCalendarDots);
export const Coffee = duo(PhCoffee);
export const DownloadSimple = duo(PhDownloadSimple);
export const Ear = duo(PhEar);
export const ArrowSquareOut = duo(PhArrowSquareOut);
export const Eye = duo(PhEye);
export const Flower = duo(PhFlower);
export const SmileySad = duo(PhSmileySad);
export const SmileyMeh = duo(PhSmileyMeh);
export const Smiley = duo(PhSmiley);
export const SmileyWink = duo(PhSmileyWink);
export const SmileyNervous = duo(PhSmileyNervous);
export const HandWaving = duo(PhHandWaving);
export const Heart = duo(PhHeart);
export const Handshake = duo(PhHandshake);
export const ClockCounterClockwise = duo(PhClockCounterClockwise);
export const Translate = duo(PhTranslate);
export const Lightbulb = duo(PhLightbulb);
export const CircleNotch = duo(PhCircleNotch);
export const LockSimple = duo(PhLockSimple);
export const SignIn = duo(PhSignIn);
export const SignOut = duo(PhSignOut);
export const EnvelopeSimple = duo(PhEnvelopeSimple);
export const MapPin = duo(PhMapPin);
export const MapTrifold = duo(PhMapTrifold);
export const Monitor = duo(PhMonitor);
export const Devices = duo(PhDevices);
export const DotsThree = duo(PhDotsThree);
export const Confetti = duo(PhConfetti);
export const Pause = duo(PhPause);
export const Play = duo(PhPlay);
export const Phone = duo(PhPhone);
export const PhoneCall = duo(PhPhoneCall);
export const Plus = duo(PhPlus);
export const PresentationChart = duo(PhPresentationChart);
export const ArrowCounterClockwise = duo(PhArrowCounterClockwise);
export const MagnifyingGlass = duo(PhMagnifyingGlass);
export const ShieldWarning = duo(PhShieldWarning);
export const ShieldCheck = duo(PhShieldCheck);
export const SkipForward = duo(PhSkipForward);
export const DeviceMobile = duo(PhDeviceMobile);
export const Timer = duo(PhTimer);
export const TrendUp = duo(PhTrendUp);
export const TrendDown = duo(PhTrendDown);
export const Trash = duo(PhTrash);
export const UsersThree = duo(PhUsersThree);
export const Wallet = duo(PhWallet);
export const X = duo(PhX);
export const Lightning = duo(PhLightning);
export const Star = duo(PhStar);
export const NavigationArrow = duo(PhNavigationArrow);
export const Clock = duo(PhClock);
export const Globe = duo(PhGlobe);
export const Quotes = duo(PhQuotes);
export const Wind = duo(PhWind);
export const Mountains = duo(PhMountains);
export const Target = duo(PhTarget);
export const Feather = duo(PhFeather);
export const Compass = duo(PhCompass);
export const Leaf = duo(PhLeaf);
export const PaperPlaneRight = duo(PhPaperPlaneRight);
export const Waveform = duo(PhWaveform);
export const Butterfly = duo(PhButterfly);
export const Fingerprint = duo(PhFingerprint);
export const FlowerLotus = duo(PhFlowerLotus);
export const Warning = duo(PhWarning);
export const WarningOctagon = duo(PhWarningOctagon);
export const XCircle = duo(PhXCircle);
export const Microphone = duo(PhMicrophone);
export const Crosshair = duo(PhCrosshair);
export const Sliders = duo(PhSliders);
export const Funnel = duo(PhFunnel);
export const UserCircle = duo(PhUserCircle);
export const Medal = duo(PhMedal);
export const Path = duo(PhPath);
export const Moon = duo(PhMoon);
export const HeartHalf = duo(PhHeartHalf);
export const Atom = duo(PhAtom);
export const Drop = duo(PhDrop);
export const Gauge = duo(PhGauge);
export const Notebook = duo(PhNotebook);
export const NotePencil = duo(PhNotePencil);
export const PersonSimpleTaiChi = duo(PhPersonSimpleTaiChi);
export const SpeakerHigh = duo(PhSpeakerHigh);
export const CloudSlash = duo(PhCloudSlash);
export const MagnifyingGlassMinus = duo(PhMagnifyingGlassMinus);
export const ArrowDown = duo(PhArrowDown);
