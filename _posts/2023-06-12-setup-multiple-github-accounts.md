---
layout: post
title:  "Setup Multiple Github Accounts"
date:   2023-06-12 17:38:09 -0300
categories: authentication authorization
---

Sometimes you need to use more than one account on your machine, whether it's for work purposes or other reasons.

## How to add multiple GitHub accounts?
You can use ssh keys and define host aliases in ssh config file (each alias for an account).
For archieve this you can follow the next steps.

1. [Generate ssh key pairs for accounts](https://help.github.com/articles/generating-a-new-ssh-key/) and [add them to GitHub accounts](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/).

2. Set up in your **~/.ssh/config** with different host for different accounts. If you don't have the file you'll need to create it.

    In this example we use *github.com* for the work account and *me.github.com* for our personal account.
    
    ```conf
    # Defaul Account // Work_Account
    Host github.com
    User work-user
    AddKeysToAgent yes
    UseKeychain yes
    IdentityFile ~/.ssh/id_rsa_work # key path

    # Personal_Account
    Host me.github.com
    HostName github.com
    User personal-user
    AddKeysToAgent yes
    UseKeychain yes
    IdentityFile ~/.ssh/id_rsa_personal
    ```
3. 
Check your repository keys.

    ```shell
    $ ssh-add -l
    ```

4. 
Add Keys. Add your personal and work keys.

    ```shell
    $ ssh-add ~/.ssh/id_rsa_work
    $ ssh-add ~/.ssh/id_rsa_personal
    ```

5. 
Test your connection. check your connection to both hosts.

    ```shell
    $ ssh -T git@github.com
    $ ssh -T git@me.github.com
    ```

6. 
Now you can use both accounts in the same machine.

    ```shell
    $ git clone git@me.github.com:org2/project2.git /path/to/project2
    $ cd /path/to/project2
    ```

7. **[WARNING]** 
To avoid making commits with the wrong user, you need to be careful. To prevent this, follow the configuration steps below.

    ```shell
    $ git config user.name "work-user" # Updates git config user name
    $ git config user.email "work-user@workmail.com"
    ```
Additionally, you can change the global (default) machine user.

    ```shell
    $ git config --global user.name "work-user"
    $ git config --global user.email "work-user@workmail.com"
    ```

That's all folks!