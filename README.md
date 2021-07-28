[![ci](https://github.com/wattcode/shipments-viz/actions/workflows/github-build.yml/badge.svg?branch=main)](https://github.com/wattcode/shipments-viz/actions/workflows/github-build.yml)

# Globe Viz

Visualise trips across the globe with this simple service.

[![Demo](https://img.youtube.com/vi/Fvsm9rlYzeI/0.jpg)](https://youtu.be/Fvsm9rlYzeI)

## Quick Start

```sh
docker pull ghcr.io/wattcode/globe-viz:latest
docker run globe-viz -p 80:8080
```

## API

```json
POST /api/journeys
{
    "date" : "2011-10-20T13:00:00",
    "from" : {
        "name" : "Origin",
        "latitude" : 34.9,
        "longitude" : 150.9
    },
    "to" : {
        "name" : "Destination",
        "latitude" : 10.0,
        "longitude" : 44.5
    }
}
```

```json
GET /api/journeys
If-None-Match:<etag>
```