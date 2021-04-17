docker build . -t shipment-viz
docker rm ship-viz
Start-Process "http://localhost:8000"
docker run -p 8000:80 -it --name "ship-viz" shipment-viz