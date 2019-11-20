# Grainfield

Simplified version of the collective experiment created at the MusicTechFest in Berlin during the _Hack The Audience_ workshop (cf. [201605-musictechfest-grain-field](https://github.com/collective-soundworks-workshops/201605-musictechfest-grain-field))

To install the application (requires `node.js` and optionally `git`):
* check out the repository using `git` or download and unzip the code
* open a shell/terminal and change the current directory to the downloaded (unzipped) project directory
* run `npm install`

To run the application:
* run `npm run watch` in the project directory in an open a shell/terminal
* start the *controller* client, open the URL `<server address>:<port>/controller` in your browser 
* start the *recorder* client, open the URL `<server address>:<port>/recorder` in your browser 
* start *player* clients, open the URL `<server address>:<port>` in your browser

The port used by default is `8000`.

In the simplest case the *recorder* client should run on the same computer as the Node.js server, to avoid the necessity of using a certificate.

The application is based on the [Soundworks](https://github.com/collective-soundworks/soundworks) framework.
