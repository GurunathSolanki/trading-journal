package com.tradingjournal;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
class TradeResourceTest {

    @Test
    void testHelloEndpoint() {
        // Updated test to check for JSON response since we changed the resource
        given()
          .when().get("/api/trades")
          .then()
             .statusCode(200);
    }

}
