<h1 align="center">
    dreamlo.js
</h1>
<p align="center">
  <i>A Javascript library for creating, retrieving, updating, and deleting scores on your dreamlo leaderboard via its web API.</i>
</p>
<p align="center">
  <a href="#-examples">Examples</a> •
  <a href="#%EF%B8%8F-demo">Demo</a> •
  <a href="#-requirements">Requirements</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-about">About</a> •
  <a href="#%EF%B8%8F-acknowledgements">Acknowledgements</a> •
  <a href="#-technologies-used">Technologies Used</a> •
  <a href="#-license">License</a>
</p>
<p align="center">
  <a href="/LICENSE">
    <img src="https://img.shields.io/github/license/jmheartley/dreamlo.js?color=brightgreen" alt="GitHub License" >
  </a>
  <img src="https://img.shields.io/github/last-commit/jmheartley/dreamlo.js?color=green" alt="GitHub last commit">
  <img src="https://img.shields.io/github/contributors/jmheartley/dreamlo.js?color=yellowgreen" alt="GitHub contributors">
  <img src="https://img.shields.io/badge/total%20lines-1.1k-yellow" alt="Lines of code">
  <img src="https://img.shields.io/github/repo-size/jmheartley/dreamlo.js?color=orange"  alt="GitHub repo size">
  <img src="https://img.shields.io/npm/v/dreamlo.js?color=red" alt="NPM version">
</p>



## 👨‍🔧 Examples
Using dreamlo.js for your game's leaderboard? Send me a message with a link and I'll add it to the examples listed below:
+ [Tic-Tac-Toe](https://github.com/JMHeartley/Tic-Tac-Toe)



## ⚙️ Demo
Are you new to dreamlo? Want to test it out without having to commit? 😕

Just use the Swagger UI-like [demo page](https://JMHeartley.github.io/dreamlo.js/) to test requests and retrieve leaderboard data 😎



## 🔩 Requirements
Go to [dreamlo's official website](https://dreamlo.com/) for a unique pair of public and private codes. **Bookmark your leaderboard's page, you won't be given the URL after the first time!**

If you can afford it, I recommend upgrading your leaderboard, which:
+ 🔒 enables HTTPS for your board's URL
+ 🙌 removes the limit of 25 scores



## 🔧 Installation
There are a few ways to start working, all of which globally expose the `dreamlo` variable:
1. Manually download the compiled file `dreamlo.js` from [dist](/dist) to your appropriate project folder and load using a relative path:
```html
<script src="/path/to/dreamlo.js"></script>
```
2. Use `<script>` to reference the code through [jsDelivr's CDN](https://www.jsdelivr.com/package/npm/dreamlo.js):
```html
<script src="https://cdn.jsdelivr.net/npm/dreamlo.js@1.2.0/dist/dreamlo.min.js"></script>
```
3. Install the [package via npm](https://www.npmjs.com/package/dreamlo.js) with the following command:
```bash
npm install dreamlo.js
```



## 🤖 Usage
The methods below, except `initialize()`, are all [Promises](https://javascript.info/promise-basics), so they can wait for the HTTP response. Failed HTTP requests will throw an `Error` containing the [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

You can use these methods with [Promise chains](https://javascript.info/promise-chaining):

```javascript
dreamlo.getScores()
    .then((scores) => {
      // do stuff with scores
    })
    .catch((error) => {
      // do something with error
    });
```

or [async/await](https://javascript.info/async-await):

```javascript
try {
  var scores = await dreamlo.getScores();
  // do stuff with scores
} catch (error) {
  // do something with error
}
```

### initiailize
```javascript
dreamlo.initialize(publicCode, privateCode, useHttps)
```
The `initialize` function sets the public and private codes and specifies whether the base URL uses HTTP or HTTPS protocol. Call this method before any others.
+ `publicCode`: the public code of your leaderboard
+ `privateCode`: the private code of your leaderboard
+ `useHttps`: toggles HTTP or HTTPS on the base URL (default: `false`)

### getScore
```javascript
dreamlo.getScore(name, format)
```
The `getScore` function sends a request for one score and returns it in the desired format as a `string`.
+ `name`: the name value of the score to request
+ `format`: the format type of the returned score (default format: `Object`; see [Formats](#score-formats) for all available types)

### getScores
```javascript
dreamlo.getScores(format, sortOrder, skip, take)
```
The `getScores` function sends a request for multiple scores and returns them in desired order and format as a `string`.

+ `format`: the format type of the returned score (default format: `Object[]`; see [Formats](#score-formats) for all available types)
+ `sortOrder`: the sorting order of the retrieved scores (default order: Descending by Points; see [Sorting Order](#sorting-order) for all available orders)
+ `skip`: the score rank you want to start sorting at (default: `0`; zero-based index)
+ `take`: the number of scores you want to retrieve (default: `undefined`; retrieves all scores)

*All parameters are optional or have default values; calling with no parameters will return all scores, sorted by points in descending order, as an array of Objects.*

### addScore
```javascript
dreamlo.addScore(score, format, sortOrder, canOverwrite)
```
The `addScore` function sends a request to add a score to the leaderboard and returns all scores in desired order and format as a `string`.

+ `score`: the score to add to the leaderboard (see [Score](#score) for the expected shape of this object)
+ `format`: the format type of the returned score (default format: `Object[]`; see [Formats](#score-formats) for all available types)
+ `sortOrder`: the sorting order of the retrieved scores (default order: Descending by Points; see [Sorting Order](#sorting-order) for all available orders)
+ `canOverwrite`: when adding a `score` whose `score.name` is already present on the leaderboard, if this is set to `true`, the `score` with higher `score.points` is saved; if set to `false`, an `Error` is thrown (default: `false`)

**Tip:** if updating a score on the leaderboard, set `canOverwrite` to `true`, if adding a new score, set `canOverwrite` to `false`.

### deleteScore
```javascript
dreamlo.deleteScore(name)
```
The `deleteScore` function sends a request to to delete one score from the leaderboard.
+ `name`: the name value of the score to delete

### deleteScores
```javascript
dreamlo.deleteScores()
```
The `deleteScores` function sends a request to delete all scores from the leaderboard.

### Score
```javascript
{
    name: string,
    points: number,
    seconds: number,
    text: string
}
```
The `score` object is the data you send to the leaderboard.
+ `name`: the unique identifier for `score`s; instead of using a player's name, try a distinct value, like a [timestamp](https://www.w3docs.com/snippets/javascript/how-to-get-a-timestamp-in-javascript.html)
+ `points`: the primary numbric value; can be used to [sort](#sorting-order) `score`s
+ `seconds`: the secondary numbric value; can be used to [sort](#sorting-order) `score`s
+ `text`: contains extra data relating to the `score`

**Tip:** if you have lots of extra data you want to store, you can use `score.text` to save a pipe-delimited string and then decode/recode the information in your program.

dreamlo doesn't allow the use of the asterisk character ( * ); all occurrences will be replaced by the underscore character ( _ ).

*See [Score](/src/score.ts) for this Typescript interface.*

### Score Formats
The format type of scores returned from the leaderboard can be specified using the following properties:
Format            | Property
------------------| ------------
Javascript Object | `dreamLo.ScoreFormat.Object`
JSON              | `dreamlo.ScoreFormat.Json`
XML               | `dreamlo.ScoreFormat.Xml`
Pipe-delimited    | `dreamlo.ScoreFormat.Pipe`
Quoted with comma | `dreamlo.ScoreFormat.Quote`

`Object` returns an array of scores for `addScore` and `getScores`, and a single score object for `getScore`. The remainder of the formats return scores nested within `dreamlo.leaderboard.entries`.

Scores returned have the same properties as the `score` object, plus an additional `date` property that contains the timestamp when the score was updated.

*See [ScoreFormat](/src/scoreFormat.ts) for this Typescript enum.*

### Sorting Order
The sorting order of scores returned from the leaderboard can be specified using the following properties: 
Order                 | Property
--------------------- | ------------
Descending by Points  | `dreamlo.SortOrder.PointsDescending`
Ascending by Points   | `dreamlo.SortOrder.PointsAscending`
Descending by Seconds | `dreamlo.SortOrder.SecondsDescending`
Ascending by Seconds  | `dreamlo.SortOrder.SecondsAscending`
Descending by Date    | `dreamlo.SortOrder.DateDescending`
Ascending by Date     | `dreamlo.SortOrder.DateAscending`

*See [SortOrder](/src/sortOrder.ts) for this Typescript enum.*



## 🤔 About
### What is dreamlo?
dreamlo is a cloud server for hosting leaderboards for game developers.
Out of love for Unity, Carmine Guida started hosting dreamlo. He created [an asset](https://assetstore.unity.com/packages/tools/network/dreamlo-com-free-instant-leaderboards-and-promocode-system-3862)
for the game engine so anyone can effortlessly add a leaderboard to their games.

*Check out [dreamlo's official FAQs page](https://www.dreamlo.com/faq) for more info.*

### Why use dreamlo with Javascript?
Previously, I used the dreamlo game asset for [the game my team built for the GTMK 2020 game jam.](https://github.com/JMHeartley/Work-With-Me-Here)

Years later, I started sprucing up [an old TicTacToe game I made years ago](https://github.com/JMHeartley/TicTacToe)
and wanted to add a leaderboard. The first thing that came to mind was dreamlo, but there was a problem, the script for dreamlo that comes with the Unity game asset was written in C#.

I created this script because any game that can make HTTP requests can use dreamlo. Happily, I've extended Carmine's original dream(lo) to Javascript 😊



## ❤️ Acknowledgements
☁️ [Carmine T. Guida](https://carmine.com/) for creating and hosting dreamlo

👩🏼‍🏫 [Microsoft Learn](https://learn.microsoft.com/en-us/training/paths/build-javascript-applications-typescript/) 
for [teaching me Typescript](https://learn.microsoft.com/en-us/training/achievements/learn.language.build-javascript-applications-typescript.trophy?username=JMHeartley)



## 👨🏽‍💻 Technologies Used
+ [Typescript](https://www.typescriptlang.org/) - Javascript superset
+ [VSCode](https://code.visualstudio.com/) - code editor
+ [HTML](https://www.w3schools.com/html/) - webpage markup language (used in [demo page](#%EF%B8%8F-demo))
+ [Bootstrap](https://getbootstrap.com/) - CSS Library (used in [demo page](#%EF%B8%8F-demo))
+ [Javascript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_is_JavaScript) - webpage interactivity language (used in [demo page](#%EF%B8%8F-demo))
+ [jQuery](https://jquery.com/) - Javascript shorthand library (used in [demo page](#%EF%B8%8F-demo))



## 📃 License
[The MIT License (MIT)](/LICENSE)

Copyright (c) 2022 Justin M Heartley
