<h1 align="center">
    DreamLo Leaderboard (Javascript)
</h1>
<p align="center">
  <i>A Javascript library for creating, retrieving, updating, and deleting scores on your DreamLo leaderboard via its web API.</i>
</p>



## 🔩 Requirements
Go to [DreamLo's offical website](https://dreamlo.com/) to get a unique pair of public and private keys. **Bookmark your leaderboard's page, you won't be given the url after the first time!**

If you can afford it, I recommend upgrading your leaderboard which:
+ 🔒 enables secure http for your board's url
+ 💪 removes the limit of 25 scores



## 🔧 Installation
There are a few ways to start working, all of which globally expose the `dreamLo` variable:
1. Manually download the compiled file `dreamlo.js` from [dist](/dist) to your appropriate project folder and load using a relative path:
```html
<script src="/path/to/dreamLo.js"></script>
```
2. Use `<script>` to reference the code through [jsDelivr's CDN](https://www.jsdelivr.com/package/npm/dreamlo-leaderboard-javascript):
```html
<script src="https://cdn.jsdelivr.net/npm/dreamlo-leaderboard-javascript@1.0.0/dist/dreamLo.min.js"></script>
```
3. Install as a package via npm with the following command:
```bash
npm install dreamlo-leaderboard-javascript
```



## 🤖 Usage
The methods below, with the except of `initialize()` are all [Promises](https://developer.mozilla.org/en-US/docs/web/javascript/reference/global_objects/promise)
, so they wait for the Http response. Such methods would be used as such:
```javascript
dreamLo.getScores()
    .then((scores) => {
      // do stuff with scores
    });
```

### initiailize
```javascript
dreamLo.initialize(publicKey, privateKey, useHttps)
```
The `initialize` function is used to set public key, private key, and specify whether http or https is being used for the base url. This should be called before any other methods.
+ `publicKey`: the public key of your leaderboard
+ `privateKey`: the private key of your leaderboard
+ `useHttps`: toggles http or https of the base URL (default: `false`)

### getScore
```javascript
dreamLo.getScore(name, format)
```
The `getScore` function is used to get one score; returns score in desired format as a `string` or `Array`.
+ `name`: the name value of the score to retreive
+ `format`: the format type of the returned score (default format: JSON; see [Formats](#score-formats) for all available types)

### getScores
```javascript
dreamLo.getScores(format, sortOrder, skip, take)
```
The `getScores` function is used to get multiple scores; returns scores in desired order and format as a `string` or `Array`.

+ `format`: the format type of the returned score (default format: JSON; see [Formats](#score-formats) for all available types)
+ `sortOrder`: the sorting order of the retreived scores (default order: Descending by Points; see [Sorting Order](#sorting-order) for all available orders)
+ `skip`: the score rank you want to start sorting at (default: `0`; zero-based index)
+ `take`: the number of scores you want to retrieve (exclude to retrieve all scores)

*All of the parameters are optional or have default values, calling with no parameters will return all scores, sorted by points in descending order, as a JSON string.*

### addScore
```javascript
dreamlo.addScore(score, format, sortOrder)
```
The `addScore` function is used to add a score to the leaderboard; returns scores in desired order and format as a `string` or `Array`.

Adding a `score` where the `score.name` is already present on the leaderboard will overwrite the older score.

+ `score`: the score to add to the leaderboard (see [Score](#score) for the expected shape of this object)
+ `format`: the format type of the returned score (default format: JSON; see [Formats](#score-formats) for all available types)
+ `sortOrder`: the sorting order of the retreived scores (default order: Descending by Points; see [Sorting Order](#sorting-order) for all available orders)

### deleteScore
```javascript
dreamLo.deleteScore(name)
```
The `deleteScore` function is used to delete one score from the leaderboard.
+ `name`: the name value of the score to delete

### deleteScores
```javascript
dreamLo.deleteScores()
```
The `deleteScores` function is used to delete all scores from the leaderboard.

### Score
The `score` object represents one score on the leaderboard and has the following properties:
```javascript
{
    name: string;
    points: number;
    seconds: number;    //optional
    text: string;       //optional
}
```

*See [Score](/src/score.ts) for this Typescript interface.*

### Score Formats
The format type of scores returned from the leaderboard can be specified using the following properties:
Format            | Property
------------------| ------------
JSON              | `dreamLo.ScoreFormat.Json`
XML               | `dreamLo.ScoreFormat.Xml`
Pipe-delimited    | `dreamLo.ScoreFormat.Pipe`
Quoted with comma | `dreamLo.ScoreFormat.Quote`
JS Array Object   | `dreamLo.ScoreFormat.Array`

Scores returned in these formats are nested within `dreamlo.leaderboard.entries`, with the exception of `Array`.

Scores returned have the same properties as the `score` object, plus an additional `date` property that contains the timestamp the score was added to the leaderboard.

*See [ScoreFormat](/src/scoreFormat.ts) for this Typescript enum.*

### Sorting Order
The sorting order of scores returned form the leaderboard can be specified using the following properties: 
Order                 | Property
--------------------- | ------------
Descending by Points  | `dreamLo.SortOrder.PointsDescending`
Ascending by Points   | `dreamLo.SortOrder.PointsAscending`
Descending by Seconds | `dreamLo.SortOrder.SecondsDescending`
Ascending by Seconds  | `dreamLo.SortOrder.SecondsAscending`
Descending by Date    | `dreamLo.SortOrder.DateDescending`
Ascending by Date     | `dreamLo.SortOrder.DateAscending`

*See [SortOrder](/src/sortOrder.ts) for this Typescript enum.*



## 🤔 About
### What is DreamLo?
DreamLo is a cloud server for hosting leaderboards for game developers.
Carmine Guida, out of love for the Unity, started hosting DreamLo and created [an asset](https://assetstore.unity.com/packages/tools/network/dreamlo-com-free-instant-leaderboards-and-promocode-system-3862)
for the game engine so anyone can effortlessly add leaderboard to their games.

*Check out [its FAQs page](https://www.dreamlo.com/faq) for more info.*

### Why use DreamLo with Javascript?
Previously, I used the DreamLo game asset for [the game my team built for the GTMK 2020 game jam.](https://github.com/JMHeartley/Work-With-Me-Here)

Years later, I started sprucing up [an old TicTacToe game I made years ago](https://github.com/JMHeartley/TicTacToe)
and wanted to add a leaderboard. The first thing that came to mind was DreamLo but there was a problem, the script for DreamLo that comes with the Unity game asset is written in C#.

I created this script because DreamLo can be used with any game that can make http requests. Happily, I've extended Carmine's original dream(lo) to Javascript.



## ❤️ Acknowledgements
☁️ [Carmine T. Guida](https://carmine.com/) for creating and hosting DreamLo

👩🏼‍🏫 [Microsoft Learn](https://learn.microsoft.com/en-us/training/paths/build-javascript-applications-typescript/) 
for [teaching me Typescript](https://learn.microsoft.com/en-us/training/achievements/learn.language.build-javascript-applications-typescript.trophy?username=JMHeartley)



## 👨🏽‍💻 Technologies Used
+ [Typescript](https://www.typescriptlang.org/) - Javascript superset
+ [VSCode](https://code.visualstudio.com/) - code editor



## 📃 License
[The MIT License (MIT)](/LICENSE)

Copyright (c) 2022 Justin M Heartley
