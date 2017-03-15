# Integrate with IBM&reg; UrbanCode Deploy
This extension provides build tasks that enable you to integrate with IBM UrbanCode Deploy using the [command-line client](http://www.ibm.com/support/knowledgecenter/SS4GSP_6.2.1/com.ibm.udeploy.reference.doc/topics/cli_ch.html).

The IBM UrbanCode Deploy command-line client can be downloaded from [this Maven repository](https://public.dhe.ibm.com/software/products/UrbanCode/maven2/com/ibm/urbancode/commons/udclient/).

## Create a IBM UrbanCode Deploy connection
Create a Generic Service Endpoint and specify your IBM UrbanCode Deploy endpoint URL, username, and password, or just password for token authentication.

![UrbanCode Deploy Endpoint](images/udEndpoint.png)

## Define your build process
Create a build definition to automate your build process. For detailed instructions on setting up a build definition, check out [this](https://msdn.microsoft.com/library/vs/alm/build/define/create).

Add one of the IBM UrbanCode Deploy build tasks to your build steps and specify the input arguments.

![UrbanCode Deploy Build Tasks](images/udBuildTasks.png)

Use the IBM UrbanCode Deploy Component Version task to easily create a component version for the build, upload files to the component, link back to the build, and tag the component.

![UrbanCode Deploy Build Task](images/udPushComponentVersion.png)

Use the IBM UrbanCode Deploy Client task to run any command supported by the [IBM UrbanCode Deploy command-line client](http://www.ibm.com/support/knowledgecenter/SS4GSP_6.2.1/com.ibm.udeploy.reference.doc/topics/cli_ch.html).

![UrbanCode Deploy Build Task](images/udClientTask.png)

## Install the [IBM UrbanCode Deploy command-line client](http://www.ibm.com/support/knowledgecenter/SS4GSP_6.2.1/com.ibm.udeploy.reference.doc/topics/cli_ch.html) on your build agent

The IBM UrbanCode Deploy command-line client can be downloaded from [this Maven repository](https://public.dhe.ibm.com/software/products/UrbanCode/maven2/com/ibm/urbancode/commons/udclient/).

The task will look for the IBM UrbanCode Deploy command-line client on the path of your build machine.  An alternate mechanism is to explicitly specify the location in the **Advanced** section of the task.  This can be a local path on the build machine.  You can also add udclient.jar to source control and specify the path to it.  

## Learn more
More documentation is available [here](https://github.com/Microsoft/vsts-urbancode-deploy).

## License
The [code](https://github.com/Microsoft/vsts-urbancode-deploy) is open-sourced under the MIT license. We love and encourage community contributions.  
