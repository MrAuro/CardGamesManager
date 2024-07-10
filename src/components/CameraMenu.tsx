import {
  Button,
  Center,
  Code,
  Divider,
  Flex,
  Image,
  Overlay,
  Paper,
  ScrollArea,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";

import Webcam from "react-webcam";

import { SETTINGS_STATE } from "@/Root";
import { Card, CardRank_NOEMPTY, CardSuit_NOEMPTY } from "@/types/Card";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useElementSize } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconCamera, IconPlus } from "@tabler/icons-react";
import { useRecoilValue } from "recoil";
import PlayingCard from "./PlayingCard";

export default function CameraMenu() {
  const theme = useMantineTheme();
  const [image, setImage] = useState<string | null>(null);
  const [stats, setStats] = useState<string>("No image captured");

  const [flashTime, setFlashTime] = useState<number>(0);

  const settings = useRecoilValue(SETTINGS_STATE);

  const [rawResponse, setRawResponse] = useState<string>("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const genAI = new GoogleGenerativeAI(settings.geminiApiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      'Determine which suit and rank the card is. You must respond in JSON format with a rank and suit field. You must give the suit in the abbreviated form (s for Spades, h for Hearts, c for Clubs, d for Diamonds). You must give the rank in the abbreviated form (A for Ace, 2-9 for cards 2-9, T for 10, J for Jacks, Q for Queens, K for Kings). [{"rank": _, "suit": _}]. Return an array of card or cards. If you cannot determine the card, return an empty array.',
  });

  const webcamRef = useRef<Webcam>(null);
  const webcamElementSize = useElementSize();

  useEffect(() => {
    (async () => {
      if (!image) {
        return;
      }

      model.generationConfig = {
        temperature: 2,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      };

      // We need to remove the data:image/png;base64, part of the image
      // and just send the base64 part
      const imageBase64 = image.split(",")[1];

      setLoading(true);
      const t0 = performance.now();
      const result = await model.generateContent([
        {
          inlineData: {
            data: imageBase64,
            mimeType: "image/png",
          },
        },
      ]);

      const response = await result.response;
      const text = await response.text();
      console.log(`AI Response: ${text}`);
      const cardData: { rank: CardRank_NOEMPTY; suit: CardSuit_NOEMPTY }[] = JSON.parse(text);
      setRawResponse(text);
      const t1 = performance.now();
      setCards(cardData.map((card) => `${card.rank.replace("10", "T")}${card.suit}` as Card));
      setLoading(false);

      setStats(`${(t1 - t0).toFixed(2)}ms • ${response.usageMetadata?.totalTokenCount} tokens`);
    })();
  }, [image]);

  return (
    <ScrollArea m="xs" scrollbars="y" type="never">
      <div ref={webcamElementSize.ref}>
        <Webcam
          width="100%"
          ref={webcamRef}
          audio={false}
          mirrored={settings.cameraFlipHorizontal}
          screenshotFormat="image/png"
          videoConstraints={{ deviceId: settings.cameraDeviceId }}
          style={{
            borderRadius: theme.radius.md,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: webcamElementSize.width,
            height: `calc(${webcamElementSize.height}px - 7px)`, // 7px is a magic number that works with multiple devices
            backgroundColor: "white",
            opacity: flashTime / 100,
            zIndex: 1,
            borderRadius: theme.radius.md,
          }}
        />
      </div>
      <Button
        fullWidth
        leftSection={<IconCamera />}
        loading={loading}
        onClick={async () => {
          if (!webcamRef.current) return;
          setImage(webcamRef.current.getScreenshot());

          // Flash effect
          setFlashTime(80); // 80% max looks better than 100%

          // Exponential decay
          for (let i = 0; i < 100; i++) {
            setTimeout(() => {
              setFlashTime((time) => time - 2);
            }, 10 * i);
          }

          setTimeout(() => {
            setFlashTime(0);
          }, 1000);
        }}
      >
        Capture
      </Button>
      <Divider my="sm" />

      <ScrollArea w={webcamElementSize.width} scrollbars="x" type="always" offsetScrollbars>
        <Flex justify="center" gap="xs">
          {cards.map((card, index) => (
            <Paper key={index} p="xs" radius="lg" withBorder>
              <Center>
                <PlayingCard key={index} onClick={() => {}} disabled card={card} />
              </Center>
              <Flex justify="center" gap="xs" mx="xs">
                <Button leftSection={<IconPlus />} color="green" variant="light" mt={5}>
                  Add
                </Button>
              </Flex>
            </Paper>
          ))}
          {cards.length === 0 && (
            <Text size="sm" c="dimmed">
              No cards detected
            </Text>
          )}
        </Flex>
      </ScrollArea>

      <Divider my="sm" />
      <Text
        c="dimmed"
        ta="center"
        size="sm"
        style={{
          cursor: "pointer",
        }}
        title="More information"
        onClick={() => {
          modals.open({
            title: "Image Capture",
            children: (
              <>
                <Code>{rawResponse}</Code>
                <Image src={image} radius="lg" />
              </>
            ),
          });
        }}
      >
        {stats}
      </Text>
      <Divider my="sm" />
      <Text
        c="dimmed"
        ta="justify"
        size="xs"
        px="sm"
        // https://stackoverflow.com/a/18170796
        style={{
          textAlignLast: "center",
        }}
      >
        Accuracy may vary. For best results, ensure the card is in focus and well lit, and that
        there are less than 4 cards in the image. Sideways cards may be detected incorrectly.
      </Text>
    </ScrollArea>
  );
}
