// Independent directing specification. Neither actor selection nor actions are inferred from dialogue speaker.
export const DIRECTION={
  "cold1": {
    "landscape": {
      "cast": [
        "player",
        "brother"
      ],
      "focus": "brother",
      "shot": "duo",
      "required": [
        "player",
        "brother"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "brother"
      ],
      "focus": "brother",
      "shot": "duo",
      "required": [
        "player",
        "brother"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "brother",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "cold2": {
    "landscape": {
      "cast": [
        "player",
        "brother"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "player",
        "brother"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "brother"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "player",
        "brother"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "player",
        "verb": "說話",
        "target": "brother",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "cold3": {
    "landscape": {
      "cast": [
        "player",
        "brother"
      ],
      "focus": "brother",
      "shot": "duo",
      "required": [
        "player",
        "brother"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "brother"
      ],
      "focus": "brother",
      "shot": "duo",
      "required": [
        "player",
        "brother"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "brother",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "cold4": {
    "landscape": {
      "cast": [
        "mother",
        "brother"
      ],
      "focus": "brother",
      "shot": "duo",
      "required": [
        "mother",
        "brother"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "brother"
      ],
      "focus": "brother",
      "shot": "duo",
      "required": [
        "mother",
        "brother"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "brother",
        "verb": "說話",
        "target": "mother",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      },
      {
        "actor": "mother",
        "verb": "聆聽哥哥的質疑",
        "target": "brother",
        "mode": "靜態反應替代，情緒立繪待補"
      }
    ],
    "gaps": [
      "媽媽沉默／擔憂的表情立繪，目前固定微笑不代表已完成情緒反應"
    ],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "cold-action": {
    "landscape": {
      "cast": [
        "mother",
        "brother"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "brother"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "brother"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "brother"
      ]
    },
    "delivery": "narration",
    "actions": [
      {
        "actor": "mother",
        "verb": "看向",
        "target": "brother",
        "mode": "靜態反應替代，轉頭／視線過渡未完成"
      },
      {
        "actor": "mother",
        "verb": "保持沉默",
        "target": null,
        "mode": "無台詞的反應鏡頭"
      }
    ],
    "gaps": [
      "媽媽轉頭與目光轉移的分層素材",
      "媽媽沉默／擔憂的表情立繪",
      "哥哥接住母親視線的反應素材"
    ],
    "context": "媽媽與哥哥・靜態反應鏡頭",
    "reason": "敘述主體為媽媽、目標為哥哥，兩種方向皆須同框，不使用主角特寫代替"
  },
  "cold5": {
    "landscape": {
      "cast": [
        "player"
      ],
      "focus": "player",
      "shot": "close",
      "required": [
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "player"
      ],
      "focus": "player",
      "shot": "close",
      "required": [
        "player"
      ]
    },
    "delivery": "internal",
    "actions": [],
    "gaps": [],
    "context": null,
    "reason": "主角回想與主觀判斷，採主角或所回想家人的合理反應鏡頭"
  },
  "mono1": {
    "landscape": {
      "cast": [
        "player"
      ],
      "focus": "player",
      "shot": "close",
      "required": [
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "player"
      ],
      "focus": "player",
      "shot": "close",
      "required": [
        "player"
      ]
    },
    "delivery": "internal",
    "actions": [],
    "gaps": [],
    "context": null,
    "reason": "主角回想與主觀判斷，採主角或所回想家人的合理反應鏡頭"
  },
  "mono2": {
    "landscape": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "internal",
    "actions": [],
    "gaps": [],
    "context": null,
    "reason": "主角回想與主觀判斷，採主角或所回想家人的合理反應鏡頭"
  },
  "mono3": {
    "landscape": {
      "cast": [
        "mother",
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "group",
      "required": [
        "mother",
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "internal",
    "actions": [],
    "gaps": [],
    "context": null,
    "reason": "主角回想與主觀判斷，採主角或所回想家人的合理反應鏡頭"
  },
  "mono4": {
    "landscape": {
      "cast": [
        "mother",
        "father"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "mother",
        "father"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "father"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "mother",
        "father"
      ]
    },
    "delivery": "narration",
    "actions": [
      {
        "actor": "father",
        "verb": "持有出租屋",
        "target": null,
        "mode": "既有敘事資訊，不是財產移轉動畫"
      },
      {
        "actor": "mother",
        "verb": "持有自住房",
        "target": null,
        "mode": "既有敘事資訊，不是財產移轉動畫"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "父母雙人鏡頭承接房屋背景資訊，不假裝用畫面確認登記或法律權利"
  },
  "mono5": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "internal",
    "actions": [],
    "gaps": [],
    "context": null,
    "reason": "主角回想與主觀判斷，採主角或所回想家人的合理反應鏡頭"
  },
  "mono6": {
    "landscape": {
      "cast": [
        "player"
      ],
      "focus": "player",
      "shot": "close",
      "required": [
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "player"
      ],
      "focus": "player",
      "shot": "close",
      "required": [
        "player"
      ]
    },
    "delivery": "internal",
    "actions": [],
    "gaps": [],
    "context": null,
    "reason": "主角回想與主觀判斷，採主角或所回想家人的合理反應鏡頭"
  },
  "meal1": {
    "landscape": {
      "cast": [
        "mother",
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "group",
      "required": [
        "mother",
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "招呼主角吃留著的飯",
        "target": "player",
        "mode": "對話意圖；不宣稱已演出拿取或搬動道具"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "meal2": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "player",
        "verb": "說話",
        "target": "father",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "meal3": {
    "landscape": {
      "cast": [
        "mother",
        "father"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "mother",
        "father"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "father"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "mother",
        "father"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "mother",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "meal-action": {
    "landscape": {
      "cast": [
        "mother",
        "father"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "father"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "father"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "father"
      ]
    },
    "delivery": "narration",
    "actions": [
      {
        "actor": "mother",
        "verb": "看爸爸而不拆穿",
        "target": "father",
        "mode": "靜態反應替代"
      }
    ],
    "gaps": [
      "媽媽看向爸爸的目光過渡",
      "留湯與保溫餐具的連續道具演出"
    ],
    "context": "媽媽與爸爸・靜態反應鏡頭",
    "reason": "媽媽看爸爸的反應鏡頭；保留留湯的重要資訊，缺少眼神與道具動作時明示待補"
  },
  "meal4": {
    "landscape": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "spouse",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "meal5": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "player",
        "verb": "說話",
        "target": "father",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "meal6": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "life1": {
    "landscape": {
      "cast": [
        "brother",
        "sister"
      ],
      "focus": "sister",
      "shot": "duo",
      "required": [
        "brother",
        "sister"
      ]
    },
    "portrait": {
      "cast": [
        "brother",
        "sister"
      ],
      "focus": "sister",
      "shot": "duo",
      "required": [
        "brother",
        "sister"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "sister",
        "verb": "說話",
        "target": "brother",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "life2": {
    "landscape": {
      "cast": [
        "brother",
        "sister"
      ],
      "focus": "brother",
      "shot": "duo",
      "required": [
        "brother",
        "sister"
      ]
    },
    "portrait": {
      "cast": [
        "brother",
        "sister"
      ],
      "focus": "brother",
      "shot": "duo",
      "required": [
        "brother",
        "sister"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "brother",
        "verb": "說話",
        "target": "sister",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "life3": {
    "landscape": {
      "cast": [
        "brother",
        "sister"
      ],
      "focus": "sister",
      "shot": "duo",
      "required": [
        "brother",
        "sister"
      ]
    },
    "portrait": {
      "cast": [
        "brother",
        "sister"
      ],
      "focus": "sister",
      "shot": "duo",
      "required": [
        "brother",
        "sister"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "sister",
        "verb": "說話",
        "target": "brother",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "life4": {
    "landscape": {
      "cast": [
        "brother",
        "sister"
      ],
      "focus": "brother",
      "shot": "duo",
      "required": [
        "brother",
        "sister"
      ]
    },
    "portrait": {
      "cast": [
        "brother",
        "sister"
      ],
      "focus": "brother",
      "shot": "duo",
      "required": [
        "brother",
        "sister"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "brother",
        "verb": "說話",
        "target": "sister",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "life5": {
    "landscape": {
      "cast": [
        "mother",
        "sister"
      ],
      "focus": "sister",
      "shot": "duo",
      "required": [
        "mother",
        "sister"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "sister"
      ],
      "focus": "sister",
      "shot": "duo",
      "required": [
        "mother",
        "sister"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "sister",
        "verb": "提醒袋子放不下",
        "target": "mother",
        "mode": "對話意圖；不宣稱已演出拿取或搬動道具"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "life6": {
    "landscape": {
      "cast": [
        "mother",
        "sister"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "sister"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "sister"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "sister"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "mother",
        "verb": "提議帶水果",
        "target": "sister",
        "mode": "對話意圖；不宣稱已演出拿取或搬動道具"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "life7": {
    "landscape": {
      "cast": [
        "mother",
        "sister"
      ],
      "focus": "sister",
      "shot": "duo",
      "required": [
        "mother",
        "sister"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "sister"
      ],
      "focus": "sister",
      "shot": "duo",
      "required": [
        "mother",
        "sister"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "sister",
        "verb": "請媽媽放回水果",
        "target": "mother",
        "mode": "對話意圖；不宣稱已演出拿取或搬動道具"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "table1": {
    "landscape": {
      "cast": [
        "mother",
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "group",
      "required": [
        "mother",
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "father"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "mother",
        "father"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "mother",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "table2": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "invite1": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "invite2": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "player",
        "verb": "說話",
        "target": "father",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "invite3": {
    "landscape": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "spouse",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "invite4": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "invite5": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "internal",
    "actions": [],
    "gaps": [],
    "context": null,
    "reason": "主角回想與主觀判斷，採主角或所回想家人的合理反應鏡頭"
  },
  "invite6": {
    "landscape": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "internal",
    "actions": [],
    "gaps": [],
    "context": null,
    "reason": "主角回想與主觀判斷，採主角或所回想家人的合理反應鏡頭"
  },
  "lifestyle": {
    "landscape": {
      "cast": [
        "father",
        "player",
        "spouse"
      ],
      "focus": "player",
      "shot": "group",
      "required": [
        "father",
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "choice",
    "actions": [],
    "gaps": [],
    "context": null,
    "reason": "選擇介面以在場家人反應承接，不宣稱已作出照顧或金錢行為"
  },
  "A-0": {
    "landscape": {
      "cast": [
        "father",
        "player",
        "spouse"
      ],
      "focus": "player",
      "shot": "group",
      "required": [
        "father",
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "player",
        "verb": "提出週末安排",
        "target": "father",
        "mode": "對話，怡君可在鏡外聆聽"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "先對爸爸回答，怡君在場；橫向三人、直向父子雙人，怡君後續有獨立回應鏡頭"
  },
  "A-1": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "A-2": {
    "landscape": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "spouse",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "A-3": {
    "landscape": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "spouse",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "A-4": {
    "landscape": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "player",
        "verb": "說話",
        "target": "spouse",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "A-5": {
    "landscape": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "spouse",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "A-action": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "narration",
    "actions": [
      {
        "actor": "player",
        "verb": "整理窗邊",
        "target": "father",
        "mode": "相關人物靜態反應，實際搬運待補"
      },
      {
        "actor": "spouse",
        "verb": "傳照片",
        "target": "player",
        "mode": "遠端事件，怡君未出現在現場"
      }
    ],
    "gaps": [
      "窗邊整理與搬櫃姿勢",
      "手機通知與孩子外出小袋照片"
    ],
    "context": "父子整理窗邊・道具演出待補",
    "reason": "以父子相關反應承接窗邊整理情境，缺少所述物件時明示缺口，不以無關人物單人特寫冒充道具特寫"
  },
  "A-6": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "A-7": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "player",
        "verb": "說話",
        "target": "father",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "A-8": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "A-9": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "internal",
    "actions": [],
    "gaps": [],
    "context": null,
    "reason": "主角回想與主觀判斷，採主角或所回想家人的合理反應鏡頭"
  },
  "B-0": {
    "landscape": {
      "cast": [
        "father",
        "player",
        "spouse"
      ],
      "focus": "player",
      "shot": "group",
      "required": [
        "father",
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "player",
        "verb": "提出週末安排",
        "target": "father",
        "mode": "對話，怡君可在鏡外聆聽"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "先對爸爸回答，怡君在場；橫向三人、直向父子雙人，怡君後續有獨立回應鏡頭"
  },
  "B-1": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "B-2": {
    "landscape": {
      "cast": [
        "mother",
        "father"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "father"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "father"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "father"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "mother",
        "verb": "提議先收小東西",
        "target": "father",
        "mode": "對話意圖；不宣稱已演出拿取或搬動道具"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "B-3": {
    "landscape": {
      "cast": [
        "mother",
        "father"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "mother",
        "father"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "father"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "mother",
        "father"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "提醒先別搬重物",
        "target": "mother",
        "mode": "對話中的要求，不宣稱搬運已發生"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "爸爸的「重的別動」是對媽媽說，不用主角取代正在被提醒的人"
  },
  "B-4": {
    "landscape": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "spouse",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "B-5": {
    "landscape": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "spouse",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "B-action": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "narration",
    "actions": [
      {
        "actor": "father",
        "verb": "預先放手套",
        "target": "player",
        "mode": "先前發生，非當下遞交"
      }
    ],
    "gaps": [
      "座位與手套的道具特寫"
    ],
    "context": "父子相見・手套道具待補",
    "reason": "以父子相關反應承接窗邊整理情境，缺少所述物件時明示缺口，不以無關人物單人特寫冒充道具特寫"
  },
  "B-6": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "B-7": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "player",
        "verb": "說話",
        "target": "father",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "B-8": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "B-9": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "narration",
    "actions": [
      {
        "actor": "father",
        "verb": "不追問並留下手套",
        "target": "player",
        "mode": "無追問的反應鏡頭，手套道具待補"
      }
    ],
    "gaps": [
      "手套留在主角座位的連續道具畫面"
    ],
    "context": "父子反應・手套道具待補",
    "reason": "以父子相關反應承接窗邊整理情境，缺少所述物件時明示缺口，不以無關人物單人特寫冒充道具特寫"
  },
  "C-0": {
    "landscape": {
      "cast": [
        "father",
        "player",
        "spouse"
      ],
      "focus": "player",
      "shot": "group",
      "required": [
        "father",
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "player",
        "verb": "提出週末安排",
        "target": "father",
        "mode": "對話，怡君可在鏡外聆聽"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "先對爸爸回答，怡君在場；橫向三人、直向父子雙人，怡君後續有獨立回應鏡頭"
  },
  "C-1": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "C-2": {
    "landscape": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "spouse",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "C-3": {
    "landscape": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "player",
        "verb": "說話",
        "target": "spouse",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "C-4": {
    "landscape": {
      "cast": [
        "player",
        "sister"
      ],
      "focus": "sister",
      "shot": "duo",
      "required": [
        "player",
        "sister"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "sister"
      ],
      "focus": "sister",
      "shot": "duo",
      "required": [
        "player",
        "sister"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "sister",
        "verb": "提出裝箱分工",
        "target": "player",
        "mode": "未來安排，不宣稱此刻已裝箱"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "妹妹對主角提出裝箱分工，不用爸爸取代被分配重物的主角"
  },
  "C-5": {
    "landscape": {
      "cast": [
        "father",
        "sister"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "sister"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "sister"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "sister"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "爸爸回應妹妹參與分工，接下一鏡妹妹提醒爸爸"
  },
  "C-6": {
    "landscape": {
      "cast": [
        "father",
        "sister"
      ],
      "focus": "sister",
      "shot": "duo",
      "required": [
        "father",
        "sister"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "sister"
      ],
      "focus": "sister",
      "shot": "duo",
      "required": [
        "father",
        "sister"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "sister",
        "verb": "說話",
        "target": "father",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "C-action": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "narration",
    "actions": [
      {
        "actor": "sister",
        "verb": "先前裝箱",
        "target": "player",
        "mode": "已在鏡外完成，不假設妹妹此刻仍在場"
      },
      {
        "actor": "player",
        "verb": "聽到中午提醒",
        "target": null,
        "mode": "道具提示待補"
      }
    ],
    "gaps": [
      "窗邊兩箱物品及未整理角落",
      "中午提醒的手機／時鐘道具"
    ],
    "context": "父子窗邊反應・箱子與提醒待補",
    "reason": "以父子相關反應承接窗邊整理情境，缺少所述物件時明示缺口，不以無關人物單人特寫冒充道具特寫"
  },
  "C-7": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "player",
        "verb": "提醒先別自行搬重物",
        "target": "father",
        "mode": "對話意圖；不宣稱已演出拿取或搬動道具"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "C-8": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "C-9": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "C-10": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "internal",
    "actions": [],
    "gaps": [],
    "context": null,
    "reason": "主角回想與主觀判斷，採主角或所回想家人的合理反應鏡頭"
  },
  "hospital1": {
    "landscape": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "player",
        "verb": "說話",
        "target": "mother",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      },
      {
        "actor": "mother",
        "verb": "陪伴與聆聽",
        "target": "player",
        "mode": "靜態候選稿，醫院情緒反應待補"
      }
    ],
    "gaps": [
      "媽媽在醫院的疲憊／擔憂反應素材，目前為單姿勢候選稿"
    ],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "hospital2": {
    "landscape": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "mother",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      },
      {
        "actor": "mother",
        "verb": "陪伴與聆聽",
        "target": "player",
        "mode": "靜態候選稿，醫院情緒反應待補"
      }
    ],
    "gaps": [
      "媽媽在醫院的疲憊／擔憂反應素材，目前為單姿勢候選稿",
      "照顧資料與閱讀姿勢；目前母親持杯素材不能冒充正在看資料"
    ],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "hospital3": {
    "landscape": {
      "cast": [
        "mother",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "mother",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "mother",
        "spouse"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "spouse",
        "verb": "說話",
        "target": "mother",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      },
      {
        "actor": "mother",
        "verb": "陪伴與聆聽",
        "target": "player",
        "mode": "靜態候選稿，醫院情緒反應待補"
      }
    ],
    "gaps": [
      "媽媽在醫院的疲憊／擔憂反應素材，目前為單姿勢候選稿"
    ],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "callback-A": {
    "landscape": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "portrait": {
      "cast": [
        "player",
        "spouse"
      ],
      "focus": "spouse",
      "shot": "duo",
      "required": [
        "player",
        "spouse"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "spouse",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "callback-B": {
    "landscape": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "father",
        "player"
      ],
      "focus": "father",
      "shot": "duo",
      "required": [
        "father",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "father",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      }
    ],
    "gaps": [],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "callback-C": {
    "landscape": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "delivery": "text-message",
    "actions": [
      {
        "actor": "sister",
        "verb": "傳來文字訊息",
        "target": "player",
        "mode": "遠端，發送者不在畫面現場"
      },
      {
        "actor": "mother",
        "verb": "陪伴與聆聽",
        "target": "player",
        "mode": "靜態候選稿，醫院情緒反應待補"
      }
    ],
    "gaps": [
      "手機與訊息道具畫面；目前僅以字幕呈現，無實際配音",
      "媽媽在醫院的疲憊／擔憂反應素材，目前為單姿勢候選稿"
    ],
    "context": "妹妹傳來的訊息・我閱讀",
    "reason": "遠端訊息以收訊者反應承接；不能把傳訊者畫成已在醫院"
  },
  "hospital4": {
    "landscape": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "delivery": "voice-message",
    "actions": [
      {
        "actor": "brother",
        "verb": "傳來語音內容",
        "target": "player",
        "mode": "遠端，發送者不在畫面現場"
      },
      {
        "actor": "mother",
        "verb": "陪伴與聆聽",
        "target": "player",
        "mode": "靜態候選稿，醫院情緒反應待補"
      }
    ],
    "gaps": [
      "手機與訊息道具畫面；目前僅以字幕呈現，無實際配音",
      "媽媽在醫院的疲憊／擔憂反應素材，目前為單姿勢候選稿"
    ],
    "context": "哥哥的語音內容・媽媽與我聆聽",
    "reason": "遠端訊息以收訊者反應承接；不能把傳訊者畫成已在醫院"
  },
  "hospital5": {
    "landscape": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "player",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "delivery": "internal",
    "actions": [
      {
        "actor": "mother",
        "verb": "陪伴與聆聽",
        "target": "player",
        "mode": "靜態候選稿，醫院情緒反應待補"
      }
    ],
    "gaps": [
      "媽媽在醫院的疲憊／擔憂反應素材，目前為單姿勢候選稿"
    ],
    "context": null,
    "reason": "主角回想與主觀判斷，採主角或所回想家人的合理反應鏡頭"
  },
  "hospital6": {
    "landscape": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "delivery": "onscreen",
    "actions": [
      {
        "actor": "mother",
        "verb": "說話",
        "target": "player",
        "mode": "有限立繪對話，不宣稱嘴型配音"
      },
      {
        "actor": "mother",
        "verb": "陪伴與聆聽",
        "target": "player",
        "mode": "靜態候選稿，醫院情緒反應待補"
      }
    ],
    "gaps": [
      "媽媽在醫院的疲憊／擔憂反應素材，目前為單姿勢候選稿"
    ],
    "context": null,
    "reason": "人物對話由說話者與在場對象同框承接"
  },
  "hospital7": {
    "landscape": {
      "cast": [
        "player"
      ],
      "focus": "player",
      "shot": "close",
      "required": [
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "player"
      ],
      "focus": "player",
      "shot": "close",
      "required": [
        "player"
      ]
    },
    "delivery": "internal",
    "actions": [],
    "gaps": [],
    "context": null,
    "reason": "主角回想與主觀判斷，採主角或所回想家人的合理反應鏡頭"
  },
  "care": {
    "landscape": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "portrait": {
      "cast": [
        "mother",
        "player"
      ],
      "focus": "mother",
      "shot": "duo",
      "required": [
        "mother",
        "player"
      ]
    },
    "delivery": "choice",
    "actions": [],
    "gaps": [],
    "context": null,
    "reason": "選擇介面以在場家人反應承接，不宣稱已作出照顧或金錢行為"
  }
};
export function cameraFor(id,portrait){const p=DIRECTION[id];if(!p)throw Error(`未設定鏡頭：${id}`);return {...p[portrait?'portrait':'landscape'],delivery:p.delivery,actions:p.actions,gaps:p.gaps,context:p.context,reason:p.reason};}
