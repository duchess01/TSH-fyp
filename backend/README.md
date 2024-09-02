To run all the microservices, run the following command:

```
docker-compose up --build
```

To tear down the containers, run the command:

```
docker-compose down -v
```

run tests

```
docker-compose -f docker-compose.test.yml up --build -d
```
