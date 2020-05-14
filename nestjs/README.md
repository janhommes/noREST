### dev

Build docker container, see dockerfile!
```
docker run -it --name mongo mongo:latest -p 27017:27017 
```

start docker container:
```
docker start mongo && docker run -it --rm -p 8081:8081 --link mongo:mongo mongo-express
```
