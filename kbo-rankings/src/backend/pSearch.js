const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: "query parameter required" });
        }

        const url = `http://koreabaseball.com/ws/Controls.asmx/GetSearchPlayer?name=${query}`;

        const response = await axios.get(url, {
            headers: {
                "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
            },
        });

        const playerData = [];

        for (let index = 0; index < response.data.now.length; index++) {
            playerData.push({
                name: response.data.now[index].P_NM,
                pId: response.data.now[index].P_ID,
                backNo: response.data.now[index].BACK_NO,
                position: response.data.now[index].POS_NO,
                team: response.data.now[index].T_ID,
                hand: response.data.now[index].P_TYPE,
                link: "https://koreabaseball.com/" + response.data.now[index].P_LINK
            });
        }

        for (let index = 0; index < response.data.retire.length; index++) {
            playerData.push({
                name: response.data.retire[index].P_NM,
                pId: response.data.retire[index].P_ID,
                backNo: response.data.retire[index].BACK_NO,
                position: response.data.retire[index].POS_NO,
                team: response.data.retire[index].T_ID,
                hand: response.data.retire[index].P_TYPE,
                link: "https://koreabaseball.com/" + response.data.retire[index].P_LINK
            });
        }

        return res.json(playerData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

module.exports = router;
