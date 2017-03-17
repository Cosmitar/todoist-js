# todoist-js
## The (un)official Todoist javascript API library
A javascript client for Todoist Sync API with full support of endpoint resources.
This is an adaptation from Todoist official [Python lib](https://github.com/Doist/todoist-python).

## How to start
install the package
`npm install todoist-js --save`
into your project

## Usage
import the API
```javascript
import TodoistAPI from 'todoist-js'
```
Create an instance providing an access token (how to [get an access token](https://github.com/Cosmitar/todoist-js/wiki/Getting-access-token)?)
```javascript
const todoist = new TodoistAPI('xxxxxxxxxx');
```

Get productivity stats
```javascript
todoist.completed.get_stats().then(stats => {
  console.log(stats.karma_trend);
});
```
&#x1F680; You can see full list of capabilities in action into [tests folder](https://github.com/Cosmitar/todoist-js/tree/master/__tests__)

Try out the lib by cloning [this Runkit notebook](https://runkit.com/58a79f5f18a61500140b4f19/58af1ca45b8f4a001496241f)

## Implementation opportunities
- Web apps or sites.
- Web plugins for content managers like Wordpress, Joomla, etc.
- Browsers add-ons.
- Mobile world with hybrid apps frameworks like react-native, Ionic and others.
- Node.js on server side and universal javascript apps.
- Web components for libs like Reactjs, Angular and more.
- Integration with desktop applications, applets, widgets and all those that support javascript.
- _Can you think of any other?_

## Documentation
Official API [Docs](https://developer.todoist.com/?python#update-multiple-ordersindents) for developers

## What's next
- [x] ~~Implement a demo app using this library.~~  this is [Asist](https://github.com/fusenlabs/asist), it can autenticate, sync, fetch and complete tasks from Todoist.
- [ ] Implement a web oAuth2 process and document it.
- [ ] Test browsers compatibility.
- [ ] Test compatibility with Node.

## Development / Testing
Clone this repo `git clone git@github.com:Cosmitar/todoist-js.git`.

This repo includes a Jest suite of tests, used for TDD.
Before start, make sure you create a `.env` file (you can use `.env-example` as template) and complete, as minimum requirement, the variable `ACCESS_TOKEN` with a valid user access token (how to [get an access token](https://github.com/Cosmitar/todoist-js/wiki/Getting-access-token)?).
Then, install all dev dependencies by running `npm install`

&#x274C; Do not run all tests together with `npm run test` or you'll get a _max request limit per seconds_ error.

Run each suite independently like:

`npm run test -t api.spec.js`

`npm run test -t completed.spec.js`

`npm run test -t filter.spec.js`
and so on.

&#x2757; Some tests can fail due to restrictions in your account if you're not premium.

If you want to test `share.spec.js` you need first to include a 2nd access token (from a different user) into `.env` file, using variable `ALTERNATIVE_ACCOUNT_ACCESS_TOKEN`

## Contributing
Pull requests and issues are welcome. If you've found an bug, please open an issue.

## License
MIT

