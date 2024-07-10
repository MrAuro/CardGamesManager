import {
  Button,
  Image,
  Paper,
  Progress,
  ScrollArea,
  Select,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";

import Webcam from "react-webcam";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { useRecoilValue } from "recoil";
import { SETTINGS_STATE } from "@/Root";
import { Card, CardRank, CardRank_NOEMPTY, CardSuit_NOEMPTY } from "@/types/Card";
import PlayingCard from "./PlayingCard";

// [{"rank": "3", "suit": "d"}] is 28 characters long
// If there are more cards, the length will be longer, but 28 is the minimum
const ESTIMATED_RESULT_LENGTH = 28;

export default function CameraMenu() {
  const theme = useMantineTheme();
  const [image, setImage] = useState<string | null>(null);

  const settings = useRecoilValue(SETTINGS_STATE);

  const [aiResult, setAiResult] = useState<string>("");
  const [cards, setCards] = useState<Card[]>([]);

  const genAI = new GoogleGenerativeAI(settings.geminiApiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      'You are a playing card identifying bot. You will be given an image and you must determine which suit and rank the card is. You must respond in JSON format. You must respond with a rank and suit field. You must give the suit in the abbreviated form (s for Spades, h for Hearts, c for Clubs, d for Diamonds). You must give the rank in the abbreviated form (A for Ace, 2-9 for cards 2-9, T for 10, J for Jacks, Q for Queens, K for Kings). [{"rank": _, "suit": _}]. Return an array of card or cards.',
  });

  const webcamRef = useRef<Webcam>(null);

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

      setAiResult("");

      const result = await model.generateContentStream([
        {
          inlineData: {
            data: imageBase64,
            mimeType: "image/png",
          },
        },
      ]);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        setAiResult((prev) => prev + chunkText);
      }

      const response = await result.response;
      const text = await response.text();
      console.log(`AI Response: ${text}`);
      const cardData: { rank: CardRank_NOEMPTY; suit: CardSuit_NOEMPTY }[] = JSON.parse(text);
      setCards(cardData.map((card) => `${card.rank}${card.suit}` as Card));
    })();
  }, [image]);

  return (
    <ScrollArea m="xs" scrollbars="y" type="never">
      <Paper
        withBorder
        p="xs"
        pt={2}
        style={{
          backgroundColor: theme.colors.dark[7],
        }}
      >
        <Webcam
          width="100%"
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/png"
          videoConstraints={{ deviceId: settings.cameraDeviceId }}
        />
        <Button
          onClick={async () => {
            if (!webcamRef.current) return;
            setImage(webcamRef.current.getScreenshot());
          }}
        >
          Detect
        </Button>
        <Progress size="sm" value={(aiResult.length / ESTIMATED_RESULT_LENGTH) * 100} />
        <Image src={image || ""} />
        {cards.map((card, index) => (
          <PlayingCard key={index} onClick={() => {}} disabled card={card} />
        ))}
      </Paper>
    </ScrollArea>
  );
}
