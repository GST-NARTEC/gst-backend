/**
 * @swagger
 * components:
 *   schemas:
 *     UserDoc:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         name:
 *           type: string
 *           description: Name of the document
 *         doc:
 *           type: string
 *           description: Path to the document file
 *         userId:
 *           type: string
 *           description: ID of the user associated with the document
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/user-docs:
 *   post:
 *     summary: Create a new user document
 *     tags: [UserDocs]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the document
 *               doc:
 *                 type: string
 *                 format: binary
 *                 description: Document file
 *     responses:
 *       201:
 *         description: Document created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /api/v1/user-docs/{id}:
 *   put:
 *     summary: Update an existing user document
 *     tags: [UserDocs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the document to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the document
 *               doc:
 *                 type: string
 *                 format: binary
 *                 description: Document file
 *     responses:
 *       200:
 *         description: Document updated successfully
 *       404:
 *         description: Document not found
 */

/**
 * @swagger
 * /api/v1/user-docs/{id}:
 *   delete:
 *     summary: Delete a user document
 *     tags: [UserDocs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the document to delete
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       404:
 *         description: Document not found
 */

/**
 * @swagger
 * /api/v1/user-docs/{userId}:
 *   get:
 *     summary: Get all documents for a user
 *     tags: [UserDocs]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve documents for
 *     responses:
 *       200:
 *         description: Documents fetched successfully
 *       404:
 *         description: User not found
 */
