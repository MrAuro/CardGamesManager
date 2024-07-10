import {
  Button,
  Center,
  Code,
  Divider,
  Flex,
  Image,
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

  const settings = useRecoilValue(SETTINGS_STATE);

  const [rawResponse, setRawResponse] = useState<string>("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const genAI = new GoogleGenerativeAI(settings.geminiApiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      'Determine which suit and rank the card is. You must respond in JSON format with a rank and suit field. You must give the suit in the abbreviated form (s for Spades, h for Hearts, c for Clubs, d for Diamonds). You must give the rank in the abbreviated form (A for Ace, 2-9 for cards 2-9, T for 10, J for Jacks, Q for Queens, K for Kings). [{"rank": _, "suit": _}]. Return an array of card or cards.',
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
      setCards(cardData.map((card) => `${card.rank}${card.suit}` as Card));
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
          screenshotFormat="image/png"
          videoConstraints={{ deviceId: settings.cameraDeviceId }}
          style={{
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
        }}
      >
        Capture
      </Button>
      <Divider my="sm" />

      <Flex justify="center" gap="md" mt="sm">
        {cards.map((card, index) => (
          <Paper key={index} p="xs" radius="lg" withBorder>
            <Center>
              <PlayingCard key={index} onClick={() => {}} disabled card={card} />
            </Center>
            <Flex justify="center" gap="xs" mx="xs">
              <Button leftSection={<IconPlus />} color="green" variant="light" mt="xs">
                Add
              </Button>
            </Flex>
          </Paper>
        ))}
        {cards.length === 0 && <Text c="dimmed">No cards detected</Text>}
      </Flex>

      <Divider my="sm" />
      <Text
        c="dimmed"
        ta="center"
        size="sm"
        style={{
          cursor: "pointer",
        }}
        title="View image capture"
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
    </ScrollArea>
  );
}
