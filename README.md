# paradox-osu-overlay

<img src="./sample1.png" width="48%"> <img src="./sample2.png" width="48%">
<img src="./sample3.png" width="48%"> <img src="./sample4.png" width="48%">

日本語の説明は[こちら](./README_JP.md)

## Overview
This is a browser-based overlay created to enhance the appearance of your osu! streaming screen. Please feel free to use this for your streams or replay recordings! (This does not alter the actual gameplay screen.)

## How to Use (with OBS Studio)
### Required Installations
- [OBS Studio (Open Broadcast Software®)](https://obsproject.com/), etc.
- [StreamCompanion](https://github.com/Piotrekol/StreamCompanion) or [tosu](https://github.com/KotRikD/tosu)

### Steps (Using StreamCompanion)
1. Download the files and move the **paradox** folder to **StreamCompanion/Files/Web/overlays/**. Make sure the path is **StreamCompanion/Files/Web/overlays/paradox**.

2. Open your streaming software (e.g., OBS Studio), add a new source, and select "Browser". In the URL field of the properties, enter [**http://127.0.0.1:20727/overlays/paradox/**](http://127.0.0.1:20727/overlays/paradox/). Check both "**Shutdown source when not visible**" and "**Refresh browser when scene becomes active**", then click OK to close the properties window.

### Using tosu
1. Download the files and move the **paradox** folder to **tosu/static/**. Make sure the path is **tosu/static/paradox**.

2. Open your streaming software, add a new source, and select "Browser". In the URL field of the properties, enter [**http://127.0.0.1:24050/paradox/**](http://127.0.0.1:24050/paradox/). Check both "**Shutdown source when not visible**" and "**Refresh browser when scene becomes active**", then click OK to close the properties window.

## Support
If you have any questions, feel free to DM me on X[(@mk_cou)](https://x.com/mk_cou). However, please note that my English isn't very good, so I appreciate your understanding.
