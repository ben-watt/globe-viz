# Shipment Viz

This app shows shipments created and visualises the origin to destination.

## Run the app

### dotnet run

`dotnet run`

Starts the app in the development mode.
Open http://localhost:8080 to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

## To do

A list of items we need to do to get this app finished

### Basics

- [x] Show and hide the settings menu
- [x] Export settings `.json`
- [ ] Import settings `.json`
- [ ] Endpoint to send data and persist it (general metadata)
- [ ] Endpoint to get all data, with parameters for a given date range
- [ ] Seperate service for listening to shipment created messages
- [ ] Deploy service to kubernetes

### Extras

- [ ] Grpc for sending data to the service?
- [ ] Hue around earth, similar to github globe
- [ ] Integrate with mapbox
- [ ] Search trips and metadata (Ctrl + K)?
- [ ] Slowely rotate globe?
- [ ] Perisit trips and timeline to explore (see google photos)