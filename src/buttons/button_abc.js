const button_abc = async ({ ack, body, context, client }) => {
  // Acknowledge the button request
  ack();

  try {
    const result = await client.views.update({
      token: context.botToken,
      // Pass the view_id
      view_id: body.view.id,
      // View payload with updated blocks
      view: {
        type: "modal",
        // View identifier
        callback_id: "view_1",
        title: {
          type: "plain_text",
          text: "Updated modal",
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "plain_text",
              text: "You updated the modal!",
            },
          },
          {
            type: "image",
            image_url:
              "https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif",
            alt_text: "Yay! The modal was updated",
          },
        ],
      },
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

module.exports = button_abc;
