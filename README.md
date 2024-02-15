# Query Data Comparator
Compares the data of a query before and after an data manipulation process.

## Installation
This program works with Node 20.x and up.
-   First, clone this repo:
    ```shell
    git clone git@github.com:sleep-written/query-data-comparator.git
    ```

-   Install all dependencies:
    ```shell
    npm ci
    ```

## Usage
To run the program, simply execute:
```shell
npm run start
```
At first run, the setup files will be created. At the next runs, the application will try to read the setup file, and execute your queries.

### Setup the program
At the first run, the program will create a file in your current working directory, called `setup.yml` like this:
```yaml
host: 127.0.0.1
port: 1433
username: -- PUT HERE YOUR DB USERNAME --
password: -- PUT HERE YOUR DB PASSWORD --
database: -- PUT HERE YOUR DB NAME --

primaryKey:     -- YOUR PK IN YOUR QUERY --
queryFetch:     ./queries/fetch.sql
queryTransact:  ./queries/transact.sql
```

Besides, a folder `./queries` with 2 files are created using the paths provided in `setup.yml`. About the parameters in `setup.yml`:
-   `queryFetch` → This file must contains a __SELECT__ SQL statement. This select will be executed before the transaction do you want to test, and at end of the transaction, <u>___before the rollback___</u>.
-   `primaryKey` → With this the program can identify the identity of every register returned by your <u>SELECT SQL statement</u>, regardless of your ORDER BY clause. The program use this to determinate if a register is added, modified or deleted.
-   `queryTransact` → This file must contain the SQL statement do you want to test. This query can make anything you want in your DB, such as edit registers, copy data, format and etc.

### Launching the program
After configured your application, you can run this app again to execute your queries.