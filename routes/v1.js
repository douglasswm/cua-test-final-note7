var express = require("express");
var app = express();
var models = require("./../models/index");
var bcrypt   = require('bcrypt-nodejs');
var passport = require('passport');
var q = require("q");
var _ = require("underscore");




var Mailgun = require('mailgun-js');
//Your api key, from Mailgun’s Control Panel
var api_key = "key-808b23273762ee898ad8e11e53124d6b";
//Your domain, from the Mailgun Control Panel
var domain = "mg.sgcarscrap.com";

//Your sending email address
var from_who = "support@sgcarscrap.com";

module.exports = function (app) {
    const version = "/v1";
    
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

     @apiDescription Retrieve alll user record.

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/users'

     @apiSuccess {Number}   id    The Users-ID.
     @apiSuccess {String}   email    User Email Address.
     @apiSuccess {String}   encrypted_password    Encrypted Password.
     @apiSuccess {String}     reset_password_token   Reset Password Token.
     @apiSuccess {String}   name    Fullname of the User.
     @apiSuccess {String}   phone Phone of the User.
     @apiSuccess {String}   bio    Biography of user.
     @apiSuccess {String}   authentication_token  Authentication Token
     @apiSuccess {DateTime}   createdAt  Created Time
     @apiSuccess {DateTime}   updatedAt  Updated Time
     @apiSuccess {DateTime}   reset_password_sent_at  DateTime of reset password
     @apiSuccess {Number}   groupid    Group Id

     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotFound   The <code>id</code> of the User was not found.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */

    //GET LIST OF USER
    app.get(version + "/api/users", function (req, res) {
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
    app.get(version + "/api/users/:id", function (req, res) {
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
    app.get(version + "/api/users/group/:groupid", function (req, res) {
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

     @apiSuccess {String}   email    User Email Address.
     @apiSuccess {Number}   groupid    Group Id

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
        var hashpassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
        models.users
            .findOrCreate({where: {email: userValue.email}, defaults:
            {email: userValue.email,
                groupid: userValue.groupid,
            name: userValue.name,
            phone: userValue.phone,
                encrypted_password: hashpassword}})
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
            html: 'Hello ' + userValue.name + ', Thank you for adding new user!'
            + 'Your password is ' + userValue.encrypted_password
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


     @apiSuccess {String}   email    User Email Address.
     @apiSuccess {Number}   groupid    Group Id
     @apiSuccess {String}   name    User Name.
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
     @api {get} /api/users Get All Groups
     @apiSampleRequest http://localhost:3000/v1/api/groups
     @apiVersion 1.0.0
     @apiName GetAllGroups
     @apiGroup Groups

     @apiDescription Retrieve alll group.

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/groups'

     @apiSuccess {Number}   groupid    Group ID.
     @apiSuccess {String}     groupname   Group Name.
     @apiSuccess {DateTime}   createdAt    Created DateTime.
     @apiSuccess {DateTime}   updatedAt Updated DateTime.

     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotFound   The <code>id</code> of the User was not found.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */

// GET LIST OF GROUPS
    app.get(version + "/api/groups", function (req, res) {
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
     @api {get} /api/users/:id/:email Get group detailed
     @apiSampleRequest http://localhost:3000/v1/api/groups/:groupid
     @apiVersion 1.0.0
     @apiName GetGroupDetailed
     @apiGroup Groups

     @apiDescription Get Group Detailed

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/groups/:groupid'

     @apiParam {Number} groupid Group unique ID.

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
    app.get(version + "/api/groups/:groupid", function (req, res) {
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
     @api {post} /api/groups Create New group
     @apiSampleRequest http://localhost:3000/v1/api/groups
     @apiVersion 1.0.0
     @apiName CreateGroup
     @apiGroup Groups

     @apiDescription Insert new group

     @apiExample Example usage:
     curl -i -X POST 'http://localhost:3000/v1/api/groups'

     @apiParam {Number} groupid Group Id.
     @apiParam {String} groupname Group Name.

     @apiSuccess {String}   message    Message.



     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError GroupNotCreated   The <name>name</name> of the Group cannot be created.

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
                .then(function (results,error) {
                    res.json({ message: 'duplicate record exists' })
                })
                
                .spread(function(user, created) {
                    console.log(user.get({
                        plain: true
                    }));
                    console.log(created);
                    res.json({ message: 'New group created !' })
                    
                })
        });

    /**
      * Documentation goes here
     @api {put} /api/groups Update Existing group
     @apiSampleRequest http://localhost:3000/v1/api/groups
     @apiVersion 1.0.0
     @apiName UpdateGroup
     @apiGroup Groups

     @apiDescription Update existing group

     @apiExample Example usage:
     curl -i -X PUT 'http://localhost:3000/v1/api/groups/:groupid'

     @apiParam {Number} groupid Group Id.
     @apiParam {String} groupname Group Name.

     @apiSuccess {String}   message    Message.



     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError GroupNotCreated   The <name>name</name> of the Group cannot be created.

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

         @apiParam {Number} groupid Group Id.

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
     @api {get} /api/lists Get All Lists
     @apiSampleRequest http://localhost:3000/v1/api/lists
     @apiVersion 1.0.0
     @apiName GetAllList
     @apiGroup List

     @apiDescription Retrieve alll List

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/lists'

     @apiSuccess {Number}   listid    List Id.
     @apiSuccess {String}     listname   List Name.
     @apiSuccess {DateTime}   createdAt    Created Date Time.
     @apiSuccess {DateTime}   updatedAt Updated Date Time.
     @apiSuccess {Number}   groupid    Group Id.

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
    /**
      * Documentation goes here
     @api {get} /api/lists Get Specific list
     @apiSampleRequest http://localhost:3000/v1/api/lists
     @apiVersion 1.0.0
     @apiName Get Specific List
     @apiGroup List

     @apiDescription Retrieve specific List

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/lists/listid'

     @apiSuccess {Number}   listid    List Id.

     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotFound   The <code>id</code> of the User was not found.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */
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
    /**
      * Documentation goes here
     @api {get} /api/lists/group/:groupid Get list for specific group
     @apiSampleRequest http://localhost:3000/v1/api/lists/group/:groupid
     @apiVersion 1.0.0
     @apiName Get List for specific group
     @apiGroup List

     @apiDescription Retrieve specific List

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/lists/group/:groupid'

     @apiSuccess {Number}   groupid    Group Id.

     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotFound   The <code>id</code> of the User was not found.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */
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
    /**
      * Documentation goes here
     @api {get} /api/lists Create New List
     @apiSampleRequest http://localhost:3000/v1/api/lists/
     @apiVersion 1.0.0
     @apiName Create New List
     @apiGroup List

     @apiDescription Create New List

     @apiExample Example usage:
     curl -i -X POST 'http://localhost:3000/v1/api/lists'

     @apiSuccess {Number}   listid    List Id.
     @apiSuccess {String}   listname    List Name.
     @apiSuccess {Number}   groupid    Group Id.

     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotFound   The <code>id</code> of the User was not found.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */
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

     @apiSuccess {Number}   listid    List Id.
     @apiSuccess {String}   listname    List Name.
     @apiSuccess {Number}   groupid    Group Id.

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

     @apiParam {Number} listid List Id.

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
     @api {get} /api/tasks Get All Tasks
     @apiSampleRequest http://localhost:3000/v1/api/tasks
     @apiVersion 1.0.0
     @apiName GetAllTasks
     @apiGroup Task

     @apiDescription Retrieve alll task

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/tasks'

     @apiSuccess {Number}   taskid    Task Id.
     @apiSuccess {String}     taskname   Task Name.
     @apiSuccess {Number}   listid    List Id
     @apiSuccess {DateTime}   createdAt Create DateTime.
     @apiSuccess {DateTime}   updatedAt    Updated DateTime.
     @apiSuccess {Number}   id  User Id

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
    /**
      * Documentation goes here
     @api {get} /api/tasks Get Specific Task Id
     @apiSampleRequest http://localhost:3000/v1/api/tasks/:taskid
     @apiVersion 1.0.0
     @apiName GetTaskDetails
     @apiGroup Task

     @apiDescription Retrieve specific Task Detailed

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/tasks/:taskid'


     @apiSuccess {Number}   taskid    Task Id.
     @apiSuccess {String}     taskname   Task Name.
     @apiSuccess {Number}   listid    List Id
     @apiSuccess {DateTime}   createdAt Create DateTime.
     @apiSuccess {DateTime}   updatedAt    Updated DateTime.
     @apiSuccess {Number}   id  User Id

     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotFound   The <code>id</code> of the User was not found.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */
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
    /**
      * Documentation goes here
     @api {get} /api/tasks/list Get Task By List
     @apiSampleRequest http://localhost:3000/v1/api/tasks/list
     @apiVersion 1.0.0
     @apiName GetTaskByList
     @apiGroup Task

     @apiDescription Retrieve Task by List

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/tasks/list


     @apiSuccess {Number}   taskid    Task Id.
     @apiSuccess {String}     taskname   Task Name.
     @apiSuccess {Number}   listid    List Id
     @apiSuccess {DateTime}   createdAt Create DateTime.
     @apiSuccess {DateTime}   updatedAt    Updated DateTime.
     @apiSuccess {Number}   id  User Id

     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotFound   The <code>id</code> of the User was not found.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */
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
    /**
      * Documentation goes here
     @api {get} /api/tasks/user Get Task By User
     @apiSampleRequest http://localhost:3000/v1/api/tasks/user
     @apiVersion 1.0.0
     @apiName GetTaskByUser
     @apiGroup Task

     @apiDescription Retrieve Task by User

     @apiExample Example usage:
     curl -i -X GET 'http://localhost:3000/v1/api/tasks/user


     @apiSuccess {Number}   taskid    Task Id.
     @apiSuccess {String}     taskname   Task Name.
     @apiSuccess {Number}   listid    List Id
     @apiSuccess {DateTime}   createdAt Create DateTime.
     @apiSuccess {DateTime}   updatedAt    Updated DateTime.
     @apiSuccess {Number}   id  User Id

     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotFound   The <code>id</code> of the User was not found.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */
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
    /**
      * Documentation goes here
     @api {post} /api/tasks Create Task
     @apiSampleRequest http://localhost:3000/v1/api/tasks
     @apiVersion 1.0.0
     @apiName CreateNewTask
     @apiGroup Task

     @apiDescription Create new Task

     @apiExample Example usage:
     curl -i -X POST 'http://localhost:3000/v1/api/tasks


     @apiParam {Number}   taskid    Task Id.
     @apiParam {String}     taskname   Task Name.
     @apiParam {Number}   listid    List Id
     @apiParam {DateTime}   createdAt Create DateTime.
     @apiParam {DateTime}   updatedAt    Updated DateTime.
     @apiParam {Number}   id  User Id

     @apiError NoAccessRight Only authenticated Admins can access the data.
     @apiError UserNotFound   The <code>id</code> of the User was not found.

     @apiErrorExample Response (example):
         HTTP/1.1 401 Not Authenticated
         {
      "error": "NoAccessRight"
    }
      */
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

    // UPDATE EXISTING task

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

    // DELETE EXISTING LIST
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





