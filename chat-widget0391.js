preChatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  userName = document.getElementById('user-name').value;
  userEmail = document.getElementById('user-email').value;

  // Check if the user already exists
  const { data: existingUsers, error: fetchError } = await supabase
    .from('chatusers')
    .select('*')
    .eq('email', userEmail)
    .eq('name', userName);

  if (fetchError) {
    console.error('Error fetching user:', fetchError);
    return;
  }

  if (existingUsers && existingUsers.length > 0) {
    // User already exists
    userId = existingUsers[0].id;
  } else {
    // User does not exist, perform upsert
    const { data: insertedUsers, error: upsertError } = await supabase
      .from('chatusers')
      .upsert([{ name: userName, email: userEmail }], { returning: 'minimal' });

    if (upsertError) {
      console.error('Error inserting user:', upsertError);
      return;
    }

    if (insertedUsers && insertedUsers.length > 0) {
      userId = insertedUsers[0].id;
    } else {
      console.error('Failed to retrieve inserted user ID.');
      return;
    }
  }

  // Send user details to server to start a private chat
  socket.emit('start_chat', { name: userName, email: userEmail });

  preChatForm.style.display = 'none';
  chatMessages.style.display = 'flex';
  chatInputContainer.style.display = 'flex';
});
