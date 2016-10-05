var express = require("express");
var app = express();
var models = require("./../models/index");
var apicache  = require('apicache');
var cache     = apicache.middleware;



var Mailgun = require('mailgun-js');
//Your api key, from Mailgun’s Control Panel
var api_key = "key-808b23273762ee898ad8e11e53124d6b";
//Your domain, from the Mailgun Control Panel
var domain = "mg.sgcarscrap.com";

//Your sending email address
var from_who = "support@sgcarscrap.com";



module.exports = function (app) {
    const version = "/v2";

    function returnResults(results, res) {
        console.log(results);
        res.status(200).send(results);
    }

    // USER ENDPOINTS

    /**
      * Documentation goes here
     @api {get} /api/users Get All users
     @apiSampleRequest http://localhost:3000/v1/api/users
     @apiVersion 1.0.0
     @apiName GetAllUser
     @apiGroup User

     @apiDescription Retrieve all user record.

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/users'

     @apiSuccess {Number}   id          The Users-ID.
     @apiSuccess {Date}     createdAt   Registration Date.
     @apiSuccess {String}   email    Email Address of User
     @apiSuccess {Number}   sign_in_count Sign in count.
     @apiSuccess {Number}   phone    Users phone.
     @apiSuccess {String}   avatar_image_uid  Avatar-Image.





     "name": null,
     "phone": null,
     "bio": null,
     "authentication_token": null,

     "updatedAt": "2016-10-05T05:12:55.000Z",
     "reset_password_sent_at": null,
     "groupid": 2

     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotFound   The <code>id</code> of the User was not found.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */

    //GET LIST OF USER
    app.get(version + "/api/users", cache('1 hour'),function (req, res) {
        models.users.findAll()
            .then(function(result) {
                console.log(result);
                returnResults(result, res);
            }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });

    //GET SPECIFIC USER
    app.get(version + "/api/users/:id", cache('1 hour'),function (req, res) {
        console.log("version 1");
        models.users.findOne({where: {id: req.params.id}})
            .then(function(result) {
                console.log(result);
                returnResults(result, res);
            }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });

    //GET LIST OF USER FROM SPECIFIC GROUP
    app.get(version + "/api/users/group/:groupid", cache('1 hour'),function (req, res) {
        models.users.findAll({where: { groupid: req.params.groupid}})
            .then(function(result) {
                console.log(result);
                returnResults(result, res);
            }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });

    /**
      * Documentation goes here
     @api {post} /api/users Create New user
     @apiSampleRequest http://localhost:3000/v1/api/users
     @apiVersion 1.0.0
     @apiName CreateUser
     @apiGroup User

     @apiDescription Insert new user

     @apiExample Example usage:
     curl -i -X POST 'http://localhost:3000/v1/api/users'

     @apiParam {String} email Email address of the user.
     @apiParam {String} name Fullname of the user.

     @apiSuccess {String}   message    Message.



     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotCreated   The <name>name</name> of the User cannot be created.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */

    //CREATE NEW USER
    app.post(version + "/api/users", function (req, res) {
        var usersdata = req.body;
        console.log(usersdata);
        // var userValue = JSON.parse(usersdata);
        var userValue = usersdata;

        models.users
            .findOrCreate({where: {email: userValue.email}, defaults:
            {email: userValue.email,
                groupid: userValue.groupid}})
            .spread(function(user, created) {
                console.log(user.get({
                    plain: true
                }))
                console.log(created)
                res.json({ message: 'New user created !' });
            })
        var mailgun = new Mailgun({apiKey: api_key, domain: domain});

        var data = {
            //Specify email data
            from: from_who,
            //The email to contact
            to: userValue.email,
            //Subject and text data
            subject: 'Hello from Note7',
            //html: 'Hello, This is not a plain-text email, I wanted to test some spicy Mailgun sauce in NodeJS! <a href="http://0.0.0.0:3030/validate?' + email + '">Click here to add your email address to a mailing list</a>'
            html: 'Hello ' + userValue.email + ', Thank you for adding new user!'
        };
        //Invokes the method to send emails given the above data with the helper library
        mailgun.messages().send(data, function (err, body) {
            //If there is an error, render the error page
            if (err) {
                //res.render('error', { error : err});
                console.log("got an error: ", err);
            }
            //Else we can greet    and leave
            else {
                //Here "submitted.jade" is the view file for this landing page
                //We pass the variable "email" from the url parameter in an object rendered by Jade
                //res.render('submitted', { email : req.params.mail });
                //
                console.log("Email Sent!!!");

            }
        })
    });

    /**
      * Documentation goes here
     @api {put} /api/users Update Existing user
     @apiSampleRequest http://localhost:3000/v1/api/users
     @apiVersion 1.0.0
     @apiName UpdateUser
     @apiGroup User

     @apiDescription Update existing user

     @apiExample Example usage:
     curl -i -X PUT 'http://localhost:3000/v1/api/users'

     @apiParam {Number} id User-Id.
     @apiParam {String} name Fullname of the user.

     @apiSuccess {String}   message    Message.



     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotCreated   The <name>name</name> of the User cannot be created.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */

    //UPDATE EXISTING USER
    app.put(version + "/api/users/:id", function (req, res) {
        var usersdata = req.body;
        // var userValue = JSON.parse(usersdata);
        var userValue=usersdata;
        models.users.findOne( {where: {id: userValue.id}})
            .then(function(result) {
                console.log(result);
                if (result) {
                    result.updateAttributes({
                        email: userValue.email,
                        groupid: userValue.groupid,
                        name: userValue.name
                    })


                }
                returnResults(result, res);

            }).catch(function (err) {
            console.error(err);
            res.json({ message: 'User is not updated!' });

            res.status(500).send(err);
        });
    });

    /**
      * Documentation goes here
     @api {delete} /api/users Delete  user
     @apiSampleRequest http://localhost:3000/v1/api/users/:id
     @apiVersion 1.0.0
     @apiName DeleteUser
     @apiGroup User

     @apiDescription Delete user

     @apiExample Example usage:
     curl -i -X DELETE 'http://localhost:3000/v1/api/users/:id'

     @apiParam {Number} id Users unique ID.

     @apiSuccess {String}   message    Message.



     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotCreated   The <name>name</name> of the User cannot be created.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */
    //DELETE EXISTING USER
    app.delete(version + "/api/users/:id", function (req, res) {
        models.users.destroy(
            { where: { id: req.params.id }}
        ).then(function(result) {
            console.log(result);
            //returnResults(result, res);
            res.json({ message: 'User has been deleted successfully!' });
        }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });


// GROUP ENDPOINTS
    /**
      * Documentation goes here
     @api {get} /api/users Get All users
     @apiSampleRequest http://localhost:3000/v1/api/users
     @apiVersion 1.0.0
     @apiName GetAllUser
     @apiGroup User

     @apiDescription Retrieve alll user record.

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/users'

     @apiSuccess {Number}   id    The Users-ID.
     @apiSuccess {Date}     remember_created_at   Registration Date.
     @apiSuccess {String}   name    Fullname of the User.
     @apiSuccess {Number}   sign_in_count Sign in count.
     @apiSuccess {Number}   phone    Users phone.
     @apiSuccess {String}   avatar_image_uid  Avatar-Image.

     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotFound   The <code>id</code> of the User was not found.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */

// GET LIST OF GROUPS
    app.get(version + "/api/groups", cache('1 hour'),function (req, res) {
        models.group.findAll()
            .then(function(result) {
                console.log(result);
                returnResults(result, res);
            }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });

    /**
      * Documentation goes here
     @api {get} /api/users/:id/:email Get user detailed
     @apiSampleRequest http://localhost:3000/v1/api/users/:id/:email
     @apiVersion 1.0.0
     @apiName GetUserDetailed
     @apiGroup User

     @apiDescription Get User Detailed

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/users/:id/:email'

     @apiParam {Number} id Users unique ID.
     @apiParam {String} email User Email.

     @apiSuccess {String}   message    Message.



     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotCreated   The <name>name</name> of the User cannot be created.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */
// GET SPECIFIC GROUP
    app.get(version + "/api/groups/:groupid", cache('1 hour'),function (req, res) {
        console.log("version 1");
        models.group.findOne({where: {groupid: req.params.groupid}})

            .then(function (result) {
                console.log(result);
                returnResults(result, res);
            }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });

    /**
      * Documentation goes here
     @api {post} /api/users Create New user
     @apiSampleRequest http://localhost:3000/v1/api/users
     @apiVersion 1.0.0
     @apiName CreateUser
     @apiGroup User

     @apiDescription Insert new user

     @apiExample Example usage:
     curl -i -X POST 'http://localhost:3000/v1/api/users'

     @apiParam {String} email Email address of the user.
     @apiParam {String} name Fullname of the user.

     @apiSuccess {String}   message    Message.



     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotCreated   The <name>name</name> of the User cannot be created.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */

    //CREATE NEW GROUP
    app.post(version + "/api/groups", function (req, res) {
        console.info("hello");
        var grpdata = req.body;
        console.log(grpdata);
        // var userValue = JSON.parse(usersdata);
        var userValue = grpdata;

        models.group
            .findOrCreate({where: {groupid: userValue.groupid}, defaults:
            {groupname: userValue.groupname,
                groupid: userValue.groupid}})
            .spread(function(user, created) {
                console.log(user.get({
                    plain: true
                }));
                console.log(created)
                res.json({ message: 'New group created !' });
            })
    });

    /**
      * Documentation goes here
     @api {put} /api/users Update Existing user
     @apiSampleRequest http://localhost:3000/v1/api/users
     @apiVersion 1.0.0
     @apiName UpdateUser
     @apiGroup User

     @apiDescription Update existing user

     @apiExample Example usage:
     curl -i -X PUT 'http://localhost:3000/v1/api/users'

     @apiParam {Number} id User-Id.
     @apiParam {String} name Fullname of the user.

     @apiSuccess {String}   message    Message.



     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotCreated   The <name>name</name> of the User cannot be created.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */

// UPDATE EXISTING GROUP
    app.put(version + "/api/groups/:groupid", function (req, res) {
        var grpsdata = req.body;
        // var userValue = JSON.parse(usersdata);
        var grpValue=grpsdata;
        models.group.findOne( {where: {groupid: grpValue.groupid}})
            .then(function(result) {
                console.log(result);
                if (result) {
                    result.updateAttributes({
                        groupname: grpValue.groupname
                    })


                }
                returnResults(result, res);

            }).catch(function (err) {
            console.error(err);
            res.json({ message: 'Group is not updated!' });

            res.status(500).send(err);
        });
    });

    /**
      * Documentation goes here
     @api {delete} /api/users Delete  user
     @apiSampleRequest http://localhost:3000/v1/api/users/:id
     @apiVersion 1.0.0
     @apiName DeleteUser
     @apiGroup User

     @apiDescription Delete user

     @apiExample Example usage:
     curl -i -X DELETE 'http://localhost:3000/v1/api/users/:id'

     @apiParam {Number} id Users unique ID.

     @apiSuccess {String}   message    Message.



     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotCreated   The <name>name</name> of the User cannot be created.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */
// DELETE EXISTING GROUP
    app.delete(version + "/api/groups/:groupid", function (req, res) {
        models.group.destroy(
            { where: { groupid: req.params.groupid }}
        ).then(function(result) {
            console.log(result);
            //returnResults(result, res);
            res.json({ message: 'group has been deleted successfully!' });
        }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });



// LIST ENDPOINTS
    /**
      * Documentation goes here
     @api {get} /api/users Get All users
     @apiSampleRequest http://localhost:3000/v1/api/users
     @apiVersion 1.0.0
     @apiName GetAllUser
     @apiGroup User

     @apiDescription Retrieve alll user record.

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/users'

     @apiSuccess {Number}   id    The Users-ID.
     @apiSuccess {Date}     remember_created_at   Registration Date.
     @apiSuccess {String}   name    Fullname of the User.
     @apiSuccess {Number}   sign_in_count Sign in count.
     @apiSuccess {Number}   phone    Users phone.
     @apiSuccess {String}   avatar_image_uid  Avatar-Image.

     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotFound   The <code>id</code> of the User was not found.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */

// GET LIST OF LISTS
    app.get(version + "/api/lists", function (req, res) {
        models.list.findAll()
            .then(function(result) {
                console.log(result);
                returnResults(result, res);
            }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });


// GET SPECIFIC LIST
    app.get(version + "/api/lists/:listid", function (req, res) {
        console.log("version 1");
        models.list.findOne({where: {listid: req.params.listid}})

            .then(function (result) {
                console.log(result);
                returnResults(result, res);
            }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });

    // GET LISTS BY GROUP
    app.get(version + "/api/lists/group/:groupid", function (req, res) {
        console.log("version 1");
        models.list.findOne({where: {groupid: req.params.groupid}})

            .then(function (result) {
                console.log(result);
                returnResults(result, res);
            }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });


    //CREATE NEW LIST
    app.post(version + "/api/lists", function (req, res) {
        console.info("hello");
        var grpdata = req.body;
        console.log(grpdata);
        // var userValue = JSON.parse(usersdata);
        var userValue = grpdata;

        models.list
            .findOrCreate({where: {listid: userValue.listid}, defaults:
            {listname: userValue.listname,
                groupid: userValue.groupid,
                listid: userValue.listid}})
            .spread(function(user, created) {
                console.log(user.get({
                    plain: true
                }));
                console.log(created);
                res.json({ message: 'New list created !' });
            })
    });

    /**
      * Documentation goes here
     @api {put} /api/users Update Existing user
     @apiSampleRequest http://localhost:3000/v1/api/users
     @apiVersion 1.0.0
     @apiName UpdateUser
     @apiGroup User

     @apiDescription Update existing user

     @apiExample Example usage:
     curl -i -X PUT 'http://localhost:3000/v1/api/users'

     @apiParam {Number} id User-Id.
     @apiParam {String} name Fullname of the user.

     @apiSuccess {String}   message    Message.



     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotCreated   The <name>name</name> of the User cannot be created.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */

// UPDATE EXISTING LIST
    app.put(version + "/api/lists/:listid", function (req, res) {
        var grpsdata = req.body;
        // var userValue = JSON.parse(usersdata);
        var grpValue=grpsdata;
        models.list.findOne( {where: {listid: grpValue.listid}})
            .then(function(result) {
                console.log(result);
                if (result) {
                    result.updateAttributes({
                        listname: grpValue.listname,
                        groupid: grpValue.groupid
                    })


                }
                returnResults(result, res);

            }).catch(function (err) {
            console.error(err);
            res.json({ message: 'Group is not updated!' });

            res.status(500).send(err);
        });
    });

    /**
      * Documentation goes here
     @api {delete} /api/users Delete  user
     @apiSampleRequest http://localhost:3000/v1/api/users/:id
     @apiVersion 1.0.0
     @apiName DeleteUser
     @apiGroup User

     @apiDescription Delete user

     @apiExample Example usage:
     curl -i -X DELETE 'http://localhost:3000/v1/api/users/:id'

     @apiParam {Number} id Users unique ID.

     @apiSuccess {String}   message    Message.



     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotCreated   The <name>name</name> of the User cannot be created.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */
// DELETE EXISTING LIST
    app.delete(version + "/api/lists/:listid", function (req, res) {
        models.list.destroy(
            { where: { listid: req.params.listid }}
        ).then(function(result) {
            console.log(result);
            //returnResults(result, res);
            res.json({ message: 'list has been deleted successfully!' });
        }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });







// TASK ENDPOINTS
    /**
      * Documentation goes here
     @api {get} /api/users Get All users
     @apiSampleRequest http://localhost:3000/v1/api/users
     @apiVersion 1.0.0
     @apiName GetAllUser
     @apiGroup User

     @apiDescription Retrieve alll user record.

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/users'

     @apiSuccess {Number}   id    The Users-ID.
     @apiSuccess {Date}     remember_created_at   Registration Date.
     @apiSuccess {String}   name    Fullname of the User.
     @apiSuccess {Number}   sign_in_count Sign in count.
     @apiSuccess {Number}   phone    Users phone.
     @apiSuccess {String}   avatar_image_uid  Avatar-Image.

     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotFound   The <code>id</code> of the User was not found.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */

// GET LIST OF TASKS
    app.get(version + "/api/tasks", function (req, res) {
        models.task.findAll()
            .then(function(result) {
                console.log(result);
                returnResults(result, res);
            }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });


// GET SPECIFIC TASK
    app.get(version + "/api/tasks/:taskid", function (req, res) {
        console.log("version 1");
        models.task.findOne({where: {taskid: req.params.taskid}})

            .then(function (result) {
                console.log(result);
                returnResults(result, res);
            }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });

    // GET TaskS BY list
    app.get(version + "/api/tasks/list/:listid", function (req, res) {
        console.log("version 1");
        models.task.findOne({where: {listid: req.params.listid}})

            .then(function (result) {
                console.log(result);
                returnResults(result, res);
            }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });

    // GET TaskS BY user
    app.get(version + "/api/tasks/user/:id", function (req, res) {
        console.log("version 1");
        models.task.findOne({where: {id: req.params.id}})

            .then(function (result) {
                console.log(result);
                returnResults(result, res);
            }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });


    //CREATE NEW TASK
    app.post(version + "/api/tasks", function (req, res) {
        console.info("hello");
        var grpdata = req.body;
        console.log(grpdata);
        // var userValue = JSON.parse(usersdata);
        var userValue = grpdata;

        models.task
            .findOrCreate({where: {taskid: userValue.taskid}, defaults:
            {taskname: userValue.taskname,
                taskid: userValue.taskid,
                listid: userValue.listid,
                id: userValue.id,
                taskStatus: userValue.taskStatus}})
            .spread(function(user, created) {
                console.log(user.get({
                    plain: true
                }));
                console.log(created);
                res.json({ message: 'New task created !' });
            })
    });

    /**
      * Documentation goes here
     @api {put} /api/users Update Existing user
     @apiSampleRequest http://localhost:3000/v1/api/users
     @apiVersion 1.0.0
     @apiName UpdateUser
     @apiGroup User

     @apiDescription Update existing user

     @apiExample Example usage:
     curl -i -X PUT 'http://localhost:3000/v1/api/users'

     @apiParam {Number} id User-Id.
     @apiParam {String} name Fullname of the user.

     @apiSuccess {String}   message    Message.



     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotCreated   The <name>name</name> of the User cannot be created.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */

// UPDATE EXISTING task
    app.put(version + "/api/tasks/:taskid", function (req, res) {
        var taskdata = req.body;
        // var userValue = JSON.parse(usersdata);
        var taskValue=taskdata;
        models.task.findOne( {where: {taskid: taskValue.taskid}})
            .then(function(result) {
                console.log(result);
                if (result) {
                    result.updateAttributes({taskname: taskValue.taskname,
                        listid: taskValue.listid,
                        id: taskValue.id,
                        taskid: taskValue.taskid,
                        taskStatus: taskValue.taskStatus
                    })


                }
                returnResults(result, res);

            }).catch(function (err) {
            console.error(err);
            res.json({ message: 'task is not updated!' });

            res.status(500).send(err);
        });
    });

    /**
      * Documentation goes here
     @api {delete} /api/users Delete  user
     @apiSampleRequest http://localhost:3000/v1/api/users/:id
     @apiVersion 1.0.0
     @apiName DeleteUser
     @apiGroup User

     @apiDescription Delete user

     @apiExample Example usage:
     curl -i -X DELETE 'http://localhost:3000/v1/api/users/:id'

     @apiParam {Number} id Users unique ID.

     @apiSuccess {String}   message    Message.



     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotCreated   The <name>name</name> of the User cannot be created.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */
// DELETE EXISTING LIST
    app.delete(version + "/api/tasks/:taskid", function (req, res) {
        models.task.destroy(
            { where: { taskid: req.params.taskid }}
        ).then(function(result) {
            console.log(result);
            //returnResults(result, res);
            res.json({ message: 'task has been deleted successfully!' });
        }).catch(function (err) {
            console.error(err);
            res.status(500).send(err);
        });
    });

};





