import React, { useState, useEffect } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { Dialogflow_V2 } from "react-native-dialogflow";
import { dialogflowConfig } from "./env";
const axios = require("axios").default;

export function Chat() {
  const [messages, setMessages] = useState([]);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    async function fetchData() {
      const token = await axios(
        `https://hackcation-ortbgm.uc.r.appspot.com/spotify-token`
      );
      setAccessToken(token.data);
    }
    fetchData();
  }, []);

  const BOT_USER = {
    _id: 2,
    name: "Pinguino",
    avatar:
      "https://cache.desktopnexus.com/thumbseg/2508/2508578-bigthumbnail.jpg",
  };

  useEffect(() => {
    Dialogflow_V2.setConfiguration(
      dialogflowConfig.client_email,
      dialogflowConfig.private_key,
      Dialogflow_V2.LANG_ENGLISH_US,
      dialogflowConfig.project_id
    );

    setMessages([
      {
        _id: 1,
        text:
          "Hello friend! My name is Pinguino and I'm here to help you! How was your day today?",
        createdAt: new Date(),
        user: BOT_USER,
      },
    ]);
  }, []);

  const onSend = (messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );

    let message = messages[0].text;

    if (message.includes("song")) {
      //get mood and do spotify stuff here
      let words = message.split(" ");
      let mood = words[words.indexOf("song") - 1];
      getRecommendation(mood);
    } else {
      Dialogflow_V2.requestQuery(
        message,
        (result) => handleGoogleResponse(result),
        (error) => console.log(error)
      );
    }
  };

  async function getRecommendation(mood) {
    console.log("Mood", mood);
    console.log("Access Token", accessToken);

    let seedParams;

    if (mood.includes("calm")) {
      seedParams = "4AkP8JV90cs05Q8vlVunMe&max_speechiness=0.5";
    } else if (mood.includes("happy")) {
      seedParams = "60nZcImufyMA1MKQY3dcCH&min_valence=0.75";
    } else if (mood.includes("sad")) {
      seedParams = "4kqUlN3craCx3ZIBIfhp2X&max_valence=0.25";
    } else if (mood.includes("playful")) {
      seedParams =
        "5PHPENfE3RVmHGAA2A7Hfx&min_valence=0.5&min_danceability=0.75";
    } else if (mood.includes("angry")) {
      seedParams = "4GzDUKkd1RwAtYZMMUBM3W&max_valence=0.5";
    }

    const config = {
      method: "get",
      url: `https://api.spotify.com/v1/recommendations?seed_tracks=${seedParams}&market=US`,
      headers: { Authorization: "Bearer " + accessToken },
      json: true,
    };
    console.log(config.url);
    let res = await axios(config);
    const randomIndex = Math.floor(Math.random() * res.data.tracks.length);
    console.log("Song", res.data.tracks[0].external_urls.spotify);
    const recommendedSong = res.data.tracks[randomIndex].external_urls.spotify;
    sendBotResponse("I recommend listening to this song: " + recommendedSong);
  }

  const handleGoogleResponse = (result) => {
    let text = result.queryResult.fulfillmentMessages[0].text.text[0];
    wait(1000).then(() => sendBotResponse(text));
  };

  function wait(timeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }

  const sendBotResponse = (text) => {
    let msg = {
      _id: messages.length + 1,
      text,
      createdAt: new Date(),
      user: BOT_USER,
    };

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [msg])
    );
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: 1,
        name: "User",
        avatar:
          "https://cdn.discordapp.com/attachments/622809737435676677/711451782307381289/hdt_logo.png",
      }}
    />
  );
}
