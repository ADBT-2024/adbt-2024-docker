# KrakowEats - Project Requirements

## Introduction

KrakowEats is a made-up company whose business is focused on delivering food from 3rd parties (restaurants) to customers. To this end, we are requested to develop the needed software products which hopefully will boost the company. After interviewing the product owners and some stakeholders, the general objectives and requirements have been agreed, as described in this document.

## General Objective: Manage customer orders to restaurants

The software has to enable customers to order products to restaurants. To this end the following objectives have been identified

* Objective 1: Restaurants management
* Objective 2: Restaurants' products management
* Objective 3: Restaurants' order management
* Objective 4: Customers' order management
* Objective 5: Users management

## Information requirements

### IR-1: Users

KrakowEats expects two types of users: restaurant owners and customers. The following information should be stored: First name, last name, email, phone number, avatar image, address and postal code. For login and authentication purposes, a password, a token and a tokenExpiration date should also be stored.

### IR-2: Restaurants

Owners manage restaurants. The following information should be stored: name, description, address, postal code, url, email, phone number, logo, hero image (it will serve as restaurant background image), shipping costs (default for orders placed to this restaurant), average service time in minutes (which will be computed from the orders record), status. A restaurant status represent if it is accepting orders, currently unavailable, or temporarily/permanently closed.
There are some predefined restaurant categories on the system, so the restaurant will belong to one restaurant category.

### IR-3: Products

Products are sold by restaurants. Each product belongs to one restaurant. The following information should be stored: name, description, price, image, order and availability. The order is intended for sorting purposes that could be defined by the owner so the products are ordered according to his/her interests.

There are some predefined product categories on the system, so the product will belong to one product category.

### IR-4: Orders

Orders are placed by customers. Each order will include a set of products from one particular restaurant. Orders cannot include products from more than one restaurant. The following information should be stored: creation date (when the customer places the order), start date (when a restaurant accepts the order), sent date (when the order leaves the restaurant) and delivery date (when the customer receives the order), total price of the products included, the address where it has to be delivered, and the shipping costs.

The system has to store the quantity of each product included in the order and the unitary price of each product at the moment of order placement.

## Class diagram proposed for design

From the information requirements and objectives described, the following class diagram is proposed:

![KrakowEats-EntityDiagram drawio (3)](https://user-images.githubusercontent.com/19324988/155700850-bb7817fb-8818-440b-97cb-4fbd33787f20.png)

## Business rules

* BR1: If an order total price is greater than 10€ the shipping costs will be 0€ (free shipping).
* BR2: An order can only include products from one restaurant
* BR3: Once an order is accepted by the restaurant owner, it cannot be modified or deleted.

## Functional requirements

### Customer functional requirements

As a customer, the system has to provide the following functionalities:

#### FR1: Restaurants listing

Customers will be able to query all restaurants.

#### FR2: Restaurants details and menu

Customers will be able to query restaurants details and the products offered by them.

#### FR3: Add, edit and remove products to a new order

A customer can add several products, and several units of a product to a new order. Before confirming, customer can edit and remove products. Once the order is confirmed, it cannot be edited or removed.

#### FR4: Confirm or dismiss new order

If an order is confirmed, it is created with the state _pending_. Shipping costs must follow BR1: _Orders greater than 10€ don't have service fee_. An order is automatically related to the customer who created it.
If an order is dismissed, nothing is created.

#### FR5: Listing my confirmed orders

A Customer will be able to check his/her confirmed orders, sorted from the most recent to the oldest.

#### FR6: Show order details

A customer will be able to look his/her orders up. The system should provide all details of an order, including the ordered products and their prices.

#### FR7: Show top 3 products

Customers will be able to query top 3 products from all restaurants. Top products are the most popular ones, in other words the best sellers.

### Owner functional requirements

As a restaurant owner, the system has to provide the following functionalities:

#### FR1: Add, list, edit and remove Restaurants

Restaurants are related to an owner, so owners can perform these operations to the restaurants owned by him. If an owner creates a Restaurant, it will be automatically related (owned) to him.

#### FR2: Add, list, edit and remove  Products

An owner can create, read, update and delete the products related to any of his owned Restaurants.

#### FR3: List orders of a Restaurant

An owner will be able to inspect orders of any of the restaurants owned by him. The order should include products related.

#### FR4: To change the state of an order

An owner can change the state of an order. States can change from: _pending_ to _in process_, from _in process_ to _sent_, and finally from _sent_ to _delivered_.

#### FR5: To Show a dashboard including some business analytics

 #yesterdayOrders, #pendingOrders, #todaysServedOrders, #invoicedToday (€)

## Non-functional requirements

### Portability

The system has to provide users the possibility to be accessed and run through the most popular operating systems for mobile and desktop devices.

### Security

Backend should include basic measures to prevent general security holes to be exploited such as: sql injection, contentSecurityPolicy, crossOriginEmbedderPolicy, crossOriginOpenerPolicy, crossOriginResourcePolicy, dnsPrefetchControl, expectCt, frameguard, hidePoweredBy, helmet.hsts, ieNoOpen, noSniff, originAgentCluster, permittedCrossDomainPolicies, referrerPolicy, xssFilter.

For login and authentication purposes, a password, a token and a tokenExpiration (token authentication strategy) date should also be stored for users.

Note: This subject does not focus on security topics, but we will use libraries made by cybersecurity experts that will help us to include these measures. In Node.js ecosystem we will use the helmet package for the rest of potential security holes when publishing REST services.

### Scalability

The system should use a stack of technologies that could be deployed in more than one machine, horizontal scalability ready.

## Proposed architecture

Once that requirements have been analyzed by our company's software architects, the following general architecture is proposed:

1. Client-server architecture model.
2. Front-end and backend independent developments.
3. One front-end development for each type of user (Customer and Owners).

Moreover, these architects propose the following technological stack:

1. Backend:
   1. Relational database or document oriented database. It may be deployed on a machine other than where the rest of subsystems are deployed.
   2. KrakowEats backend application logic developed in Node.js application server that publishes functionalities as RESTful services helped by Express.js framework.
2. Front-end:
   1. React-native based clients for both front-ends, deployable as Android, iOS or web Apps.
   1. KrakowEats-Owner App for the functionalities intended for restaurants' owners.
   1. KrakowEats-Customer App for the functionalities intended for customers.

# Backend deployment steps

1. Accept the assignment of your github classroom if you have not done it before. Once you accepted it, you will have your own copy of this project template.
1. Clone your private repository at your local development environment by opening VScode and clone it by opening Command Palette (Ctrl+Shift+P or F1) and `Git clone` this repository, or using the terminal and running

   ```Bash
   git clone <url>
   ```

      It may be necessary to setup your github username by running the following commands on your terminal:

      ```Bash
      git config --global user.name "FIRST_NAME LAST_NAME"
      git config --global user.email "MY_NAME@example.com"
      ```

   In case you are asked if you trust the author, please select yes.

1. Setup your environment files `.env.mongo.local`, `.env.mongo.atlas`, `.env.sequelize` respectively..

1. Install dependencies. Run `npm install` to download and install packages to the current project folder.

1. Setup your local mongodb or your mongodb atlas service and your local mariadb os similar.

1. Run seeders for sequelize or mongoose, and test or big datasets. Choose one of the following options:

   ```Bash
   npm run seed:{sequelize|mongo-local|mongo-atlas}
   ```

   ```Bash
   npm run seed:{sequelize|mongo-local|mongo-atlas}:big
   ```

1. Deploy the backend bu running:

   ```Bash
   npm run start:{sequelize|mongo-local|mongo-atlas}`
   ```

# Mini-projects

Develop the following exercises in new branches from the base project created from the assignment.
## 1. New Information requirements

KrakowEats company has decided to include a new functionality. Customers should be able to write reviews on the products of the restaurant. These reviews should include: a title, a body, when the review was created, when the review was updated, the customer that made the review and a numeric review from 0 to 5 (stars). Reviews can be edited and deleted by the customer that made it (owns it).

Therefore, each product could be reviewed many times. From these reviews, the average stars of the product should be computed and returned when
listing restaurant products, this is in the GET request to `/restaurants/:restaurantId/products` and to `/restaurants/:restaurantId`.

The reviews of each product should be returned when showing product details, this is in the GET request to `/products/:productId`.

Moreover, to create a review, it is expected to be done by making a POST request to `/products/:productId/reviews` with the following sample json body:

```JSON
{
   "title": "Review title",
   "body": "Review body. It can be a long text",
   "stars": 4
}
```

and should return a HTTP 200 OK Status code and the following JSON body:

```JSON
{
   "id": "reviewId",
   "title": "Review title",
   "body": "Review body. It can be a long text",
   "stars": 4,
   "userId": "theIdOfTheUserThatMadeTheReview"
}
```

Similarly, to update a review, it is expected to be done by making a PUT request to `/products/:productId/reviews/:reviewId` including the same JSON Body, and to remove a review by making a DELETE request to `/products/:productId/reviews/:reviewId`.

Develop these new requirements for both Mongoose and Sequelize in a branch named: `productReviews`

## 2. New Functional Requirements

New functional requirments have been identified. Create the necessary queries for moongoose and sequelize.

1. Top 5 restaurants by invoiced per week, per month and per year.
   HTTP GET `/restaurants/top`

1. Top 10% deliverers (restaurant that spend less time from sentAt to deliveredAt)/ Bottom 10% deliverers
   `HTTP GET /restaurants/topDeliverers`
   `HTTP GET /restaurants/bottomDeliverers`

1. Filter/Search restaurants by:
   * postal code
   * category
   * expensiven (prices over average)/non expensive (prices under average)
   * sort by delivery time (from sentAt to deliveredAt)
   * sort by preparation time (from createdAt to sentAt)
   `HTTP GET /restaurants/search?postalCode=postalCode&categoryId=categoryId&expensive={true|false}&sortBy={deliveryTime|preparationTime}`

1. Search products by name and/or description.
   `HTTP GET /products/search?query=queryText`

1. Search customers by postal code.
   `HTTP GET /users/search?postalCode=postalCode`

1. Top 10% customers by spent money from all their orders.
   `HTTP GET /users/top`

1. Customers can search their orders that include a particular product name.
   `HTTP GET /orders/search?query=queryText`

You may use indexes to improve performance.

Develop these new requirements for both Mongoose and Sequelize in a branch named: `advancedQueries`.

## 3. Performance improvements

Study and analize the performance improvements that could be applied to the base project for both database technologies.

Put a special focus on the most complex database operations.

Grading would depend on the relative performance improvement. For instance:
If base project spends 1000 ms to answer a request and the improved project spends 500 ms, the relative performance improvement would be 50%.

Afterwards, students will be ranked according to the average performance gains in the following categories:

1. By database:
   * Mongo-local
   * Mongo-atlas (RAM is limited)
   * MariaDB
2. By collection:
   * Users
   * Restaurants
   * Products
   * Orders
3. Overall

All testing will be done in the following environment:

* Big dataset seeder with the following sizes:

   ```Javascript
   const datasetsize = 10
   const nUsers = 50 * datasetsize
   const nRestaurants = 200 * datasetsize
   const nOrders = 100000 * datasetsize
   ```

   Note: MongoDB Atlas service is limited to 512Mbs of storage, so for this use case we will use `const datasetsize = 2`
* Hardware: M1 Apple Silicon, 16GB Ram
* Software: MacOS  13.2.1, Node LTS 18.13.0
* Databases:
  * MariaDB 10.8.3,
  * Mongo-local would be MongoDB Community Edition 6.0.5,
  * Mongo-atlas, the version deployed at the moment of testing.
* Running `npm run test:all:refresh` which start and run 20 iterations of `KrakowEatsTestsForBigSeeder` collection using Thunderclient CLI for each environment (sequelize, mongoose-mongo-local, mongoose-mongo-atlas) and later computing results from created CSV files under `performanceMeasurements/logs` folder using the `performanceMeasurements/computePerformance.sh` script. Aggregated results will be located at the `performanceMeasurements/aggregatedPerformance.txt` file. Detailed results can be found at `thunder-reports` and `performanceMeasurements/logs` folders.

NOTE: you need to install thunderclient cli by running:
```Bash
npm i -g @thunderclient/cli
```

These are the performance results for the base project provided:
|                | SEQUELIZE_MARIADB | MONGOOSE-MONGO-LOCAL | MONGOOSE-MONGO-ATLAS (datasetSize=2) |
|----------------|-------------------|----------------------|----------------------|
| **GLOBAL**         | 1862.05           | **39.73**            | 352.36               |
| **USERS**          | 8.05              | **6.51**             | 90.21                |
| **RESTAURANTS**    | **44.66**         | 93.31                | 465.24               |
| **PRODUCTS**       | 14414.37          | **119.42**           | 364.10               |
| **ORDERS**         | 29.02         | **21.05**                | 459.54               |

Develop these improvements for both Mongoose and Sequelize in a branch named: `performanceImprovements`.
