import { FlickerText } from "@/components/shared/flicker-text";
import { Card } from "@/components/ui/card"; // Assuming you have a Card component
import { cn } from "@/lib/utils";
import {
  Brain,
  Ghost,
  ImageIcon,
  InstagramIcon,
  Mic,
  Music,
  Pen,
  Type,
  UploadIcon,
  Video,
  Youtube,
  Zap,
} from "lucide-react";
import { Hero } from "./_components/hero";
import { StartCraptingButton } from "./_components/start-crapt-button";
import YoutubeFrame from "@/components/shared/youtube-frame";
export default async function HomePage() {
  return (
    <>
      <Hero>
        <div className="z-10">
          <FlickerText
            text="AI-Powered Scary Story Generator"
            className={cn(
              "select-none font-amatic text-[50px] font-bold md:text-[60px] lg:text-[80px]",
            )}
          />
          <p
            className={cn(
              "mx-auto my-10 w-full max-w-[800px] text-center font-jolly text-lg md:text-2xl lg:text-4xl",
            )}
          >
            Create chilling tales and viral videos for YouTube, TikTok, and
            social media with AI-generated images, voiceovers, and captions
          </p>
          <div className="mx-auto w-fit">
            <StartCraptingButton />
          </div>
          <div
            className={cn(
              "mx-auto my-4 max-w-[500px] text-center font-special text-lg md:my-12 md:text-2xl",
            )}
          >
            Join our growing community of horror enthusiasts and unleash your
            darkest imagination. Every story you create adds to the collective
            nightmare!
          </div>
        </div>
      </Hero>
      <div className="container flex flex-col items-center justify-center py-10 md:py-24">
        <h2
          className={cn(
            "mx-auto my-4 text-center font-nosifer text-lg text-red-500 md:my-12 md:text-[50px] md:leading-[50px]",
          )}
        >
          AI-Generated Horror Videos
        </h2>
        <YoutubeFrame />
        <h3
          className={cn(
            "my-4 max-w-[600px] text-center font-special text-lg md:my-12 md:text-2xl",
          )}
        >
          Experience the power of AI-generated scary stories with captivating
          visuals, haunting voiceovers, and engaging captions - perfect for
          YouTube, TikTok, and beyond!
        </h3>
      </div>
      <div className="container flex flex-col items-center justify-center py-10 md:py-24">
        <h2
          className={cn(
            "mx-auto my-4 text-center font-nosifer text-lg text-red-500 md:my-12 md:text-[50px] md:leading-[50px]",
          )}
        >
          Create Viral Horror Content in 3 Easy Steps
        </h2>
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
          <Card className="animate-float1 bg-gray-100 p-6 delay-75 dark:bg-gray-800">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
              <Pen className="h-10 w-10 text-white" />
            </div>
            <h3
              className={cn(
                "font-special text-xl font-bold text-red-500 dark:text-red-900",
              )}
            >
              1. Write Your Scary Story
            </h3>
            <p className={"font-special"}>
              Craft your own chilling tale or let our AI generate a captivating
              horror narrative that will engage your audience on YouTube,
              TikTok, and other social media platforms.
            </p>
          </Card>
          <Card className="animate-float2 bg-gray-100 p-6 delay-1000 dark:bg-gray-800">
            <div className="bg-5ed-400 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
              <Ghost className="h-10 w-10 text-white" />
            </div>
            <h3
              className={cn(
                "font-special text-xl font-bold text-red-500 dark:text-red-900",
              )}
            >
              2. Generate AI Visuals & Audio
            </h3>
            <p className="font-special">
              Our AI transforms your story into striking, atmospheric images and
              adds haunting voiceovers to perfectly capture the mood of your
              narrative.
            </p>
          </Card>
          <Card className="animate-float3 bg-gray-100 p-6 dark:bg-gray-800">
            <div className="bg-5ed-400 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
              <Video className="h-10 w-10 text-white" />
            </div>
            <h3
              className={cn(
                "font-special text-lg font-bold text-red-500 dark:text-red-900 md:text-xl",
              )}
            >
              3. Create Viral Horror Videos
            </h3>
            <p className="font-special">
              Combine your story, AI-generated visuals, immersive audio, and
              auto-generated captions to create compelling horror videos ready
              for your headless YouTube or TikTok channels.
            </p>
          </Card>
        </div>
      </div>
      <div className="container flex flex-col items-center justify-center py-10 md:py-24">
        <h2
          className={cn(
            "mx-auto my-4 text-center font-nosifer text-lg text-red-500 md:my-12 md:text-[50px] md:leading-[50px]",
          )}
        >
          Terrifying Features at Your Fingertips
        </h2>
        <div className="gap-x-8 md:grid md:grid-cols-3 lg:grid-cols-4">
          <Card className="mb-8 bg-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:shadow-red-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="mx-auto mb-6 flex h-14 w-14 !shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3
                className={cn(
                  "font-special text-xl font-bold text-red-500 dark:text-red-900",
                )}
              >
                AI Story Generation
              </h3>
            </div>
            <p className="font-special">
              Let our advanced AI craft spine-chilling narratives tailored to
              your preferences.
            </p>
          </Card>
          <Card className="mb-8 bg-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:shadow-red-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="mx-auto mb-6 flex h-14 w-14 !shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <h3
                className={cn(
                  "font-special text-xl font-bold text-red-500 dark:text-red-900",
                )}
              >
                Atmospheric Visuals
              </h3>
            </div>
            <p className="font-special">
              Generate eerie, high-quality images that bring your horror story
              to life.
            </p>
          </Card>
          <Card className="mb-8 bg-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:shadow-red-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="mx-auto mb-6 flex h-14 w-14 !shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <h3
                className={cn(
                  "font-special text-xl font-bold text-red-500 dark:text-red-900",
                )}
              >
                Haunting Voiceovers
              </h3>
            </div>
            <p className="font-special">
              Add chilling narration with our AI-powered voice synthesis
              technology.
            </p>
          </Card>
          <Card className="mb-8 bg-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:shadow-red-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="mx-auto mb-6 flex h-14 w-14 !shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
                <Video className="h-6 w-6 text-white" />
              </div>
              <h3
                className={cn(
                  "font-special text-xl font-bold text-red-500 dark:text-red-900",
                )}
              >
                Seamless Video Creation
              </h3>
            </div>
            <p className="font-special">
              Automatically combine your story, images, and audio into a
              captivating video.
            </p>
          </Card>
          <Card className="mb-8 bg-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:shadow-red-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="mx-auto mb-6 flex h-14 w-14 !shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
                <Type className="h60 w60 text-white" />
              </div>
              <h3
                className={cn(
                  "font-special text-xl font-bold text-red-500 dark:text-red-900",
                )}
              >
                Auto-Generated Captions
              </h3>
            </div>
            <p className="font-special">
              Ensure accessibility and engagement with accurate, timed captions.
            </p>
          </Card>
          <Card className="mb-8 bg-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:shadow-red-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="mx-auto mb-6 flex h-14 w-14 !shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
                <Music className="h-6 w-6 text-white" />
              </div>
              <h3
                className={cn(
                  "font-special text-xl font-bold text-red-500 dark:text-red-900",
                )}
              >
                Spooky Background Music
              </h3>
            </div>
            <p className="font-special">
              Set the mood with our library of creepy soundtracks and effects.
            </p>
          </Card>
          <Card className="mb-8 bg-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:shadow-red-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="mx-auto mb-6 flex h-14 w-14 !shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
                <UploadIcon className="h-6 w-6 text-white" />
              </div>
              <h3
                className={cn(
                  "font-special text-xl font-bold text-red-500 dark:text-red-900",
                )}
              >
                Easy Social Sharing
              </h3>
            </div>
            <p className="font-special">
              Instantly share your horror creations across multiple platforms.
            </p>
          </Card>
          <Card className="mb-8 bg-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:shadow-red-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="mx-auto mb-6 flex h-14 w-14 !shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
                <Youtube className="h-6 w-6 text-white" />
              </div>
              <h3
                className={cn(
                  "font-special text-xl font-bold text-red-500 dark:text-red-900",
                )}
              >
                YouTube Integration
              </h3>
            </div>
            <p className="font-special">
              Seamlessly upload to your YouTube channel, perfect for headless
              content creation.
            </p>
          </Card>
          <Card className="mb-8 bg-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:shadow-red-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="mx-auto mb-6 flex h-14 w-14 !shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3
                className={cn(
                  "font-special text-xl font-bold text-red-500 dark:text-red-900",
                )}
              >
                Fast Processing
              </h3>
            </div>
            <p className="font-special">
              Generate your scary story videos in minutes, not hours.
            </p>
          </Card>
          <Card className="mb-8 bg-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:shadow-red-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="mx-auto mb-6 flex h-14 w-14 !shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
                <InstagramIcon className="h-6 w-6 text-white" />
              </div>
              <h3
                className={cn(
                  "font-special text-xl font-bold text-red-500 dark:text-red-900",
                )}
              >
                TikTok-Ready Format
              </h3>
            </div>
            <p className="font-special">
              Create vertical videos optimized for TikTok&apos;s viral
              potential.
            </p>
          </Card>
          <Card className="mb-8 bg-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:shadow-red-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="mx-auto mb-6 flex h-14 w-14 !shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 dark:bg-red-900">
                <InstagramIcon className="h-6 w-6 text-white" />
              </div>
              <h3
                className={cn(
                  "font-special text-xl font-bold text-red-500 dark:text-red-900",
                )}
              >
                Instagram Stories
              </h3>
            </div>
            <p className="font-special">
              Generate spooky content perfect for Instagram Stories and Reels.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
