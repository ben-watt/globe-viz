docker build . -t shipment-viz
docker rm ship-viz
Start-Process "http://localhost:8080"
docker run -p 8080:80 -it --name "ship-viz" shipment-viz