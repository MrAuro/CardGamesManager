import {
  Button,
  Center,
  Code,
  Container,
  darken,
  Divider,
  Flex,
  Image,
  Loader,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";

import Webcam from "react-webcam";

import { emitBjAction } from "@/pages/Blackjack/routes/Round";
import { emitPokerAction } from "@/pages/Poker/routes/Round";
import { BLACKJACK_GAME_STATE, KEYBINDINGS_STATE, POKER_GAME_STATE, SETTINGS_STATE } from "@/Root";
import { Card, CardRank_NOEMPTY, CardSuit_NOEMPTY } from "@/types/Card";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useElementSize } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconCamera } from "@tabler/icons-react";
import { createEvent } from "react-event-hook";
import { useRecoilValue } from "recoil";
import PlayingCard from "./PlayingCard";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import { HOTKEY_SELECTOR_A_ENABLED, HOTKEY_SELECTOR_B_ENABLED } from "@/App";
import { useHotkeys } from "react-hotkeys-hook";
import { notifications } from "@mantine/notifications";

export const { useCameraResetListener, emitCameraReset } = createEvent("cameraReset")();

export default function CameraMenu() {
  const theme = useMantineTheme();
  const [image, setImage] = useState<string | null>(null);
  const [stats, setStats] = useState<string>("No image captured");

  const settings = useRecoilValue(SETTINGS_STATE);
  const pokerGameState = useRecoilValue(POKER_GAME_STATE).gameState;
  const blackjackGameState = useRecoilValue(BLACKJACK_GAME_STATE).gameState;

  const [keybindings] = useRecoilImmerState(KEYBINDINGS_STATE);

  const selectorA = useRecoilValue(HOTKEY_SELECTOR_A_ENABLED);
  const selectorB = useRecoilValue(HOTKEY_SELECTOR_B_ENABLED);

  keybindings.forEach((keybinding) => {
    if (keybinding.scope === "Camera Menu") {
      useHotkeys(keybinding.key, () => {
        if (keybinding.selector == "A" && !selectorA) return;
        if (keybinding.selector == "B" && !selectorB) return;

        if (keybinding.selector == "None" && (selectorA || selectorB)) return;

        switch (keybinding.action) {
          case "Capture":
            capture();
            break;

          case "Add Card":
            if (cards.length > 0) {
              // Add the first/leftmod card
              addCard(0);
            }
            break;
        }
      });
    }
  });

  const [resettingCamera, setResettingCamera] = useState(false);
  useCameraResetListener(() => {
    setResettingCamera(true);

    setTimeout(() => {
      setResettingCamera(false);
    }, 1000);
  });

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
    })().catch((e) => {
      notifications.show({
        title: "Error",
        message: e.message,
        color: "red",
      });

      setLoading(false);
    });
  }, [image]);

  const capture = () => {
    if (!webcamRef.current) return;
    if (loading) return;
    if (resettingCamera) return;

    setImage(webcamRef.current.getScreenshot());
  };

  const addCard = (index: number) => {
    const card = cards[index];
    setCards((cards) => cards.filter((_, i) => i !== index));

    if (settings.activeTab == "Poker" && pokerGameState != "PREROUND") {
      emitPokerAction(card);
    }
    if (settings.activeTab == "Blackjack" && blackjackGameState != "PREROUND") {
      emitBjAction(card);
    }
  };

  return (
    <Paper p="sm">
      {resettingCamera ? (
        <Center mb="sm">
          <Loader />
        </Center>
      ) : (
        <div
          ref={webcamElementSize.ref}
          style={{
            cursor: "pointer",
            position: "relative",
          }}
          onClick={() => {
            if (loading) return;
            if (resettingCamera) return;

            capture();
          }}
        >
          {/* We hide the loadingoverlay to prevent performance issues */}
          {loading && (
            <LoadingOverlay
              visible={loading}
              style={{
                marginBottom: "9px",
              }}
              loaderProps={{
                color: "white",
              }}
              overlayProps={{
                color: "rgba(0, 0, 0, 0.75)",
                blur: 2,
                radius: theme.radius.md,
              }}
            />
          )}
          <Webcam
            width="100%"
            ref={webcamRef}
            audio={false}
            mirrored={settings.cameraFlipHorizontal}
            screenshotFormat="image/png"
            videoConstraints={{
              deviceId: settings.cameraDeviceId,
              facingMode: {
                ideal: "environment",
              },
            }}
            style={{
              borderRadius: theme.radius.md,
            }}
          />
        </div>
      )}
      <Divider />
      {cards.length > 0 && (
        <Text c="dimmed" ta="center" size="xs" my={5}>
          Click on a card to add it to the game
        </Text>
      )}

      {cards.length == 0 && (
        <Text size="sm" c="dimmed" ta="center" mt="xs">
          No cards detected
        </Text>
      )}

      <Container
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: theme.spacing.xs,
        }}
      >
        {cards.map((card, index) => (
          <PlayingCard
            key={index}
            onClick={() => {
              addCard(index);
            }}
            disabled
            card={card}
          />
        ))}
      </Container>

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
        style={{
          textAlignLast: "center",
          marginBottom: theme.spacing.xs,
        }}
      >
        Click the camera to capture an image
      </Text>
      <Text
        c="dimmed"
        ta="justify"
        size="xs"
        px="sm"
        style={{
          textAlignLast: "center",
        }}
      >
        Accuracy may vary. For best results, ensure the card is in focus and well lit, and that
        there are less than 4 cards in the image. Sideways cards may be detected incorrectly.
      </Text>
    </Paper>
  );
}
