import java.io.*;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Objects;

public class DirCrawler extends Thread {
    private File file;
    private File targetFile;
    private Constructor parser;
    private ArrayList<Thread> childFolders = new ArrayList<>();

    DirCrawler(File file, Constructor parser) {
        this.file = file;
        targetFile = new File("site" + file.getPath().substring(file.getPath().indexOf('\\')));
        this.parser = parser;
        start();
    }

    @Override
    public void run() {
        try {
            for (File fl : Objects.requireNonNull(file.listFiles())) {
                if (fl.isDirectory()) childFolders.add(new DirCrawler(fl, parser));
                else {
                    String[] split = fl.getName().split("\\.");
                    //noinspection ResultOfMethodCallIgnored
                    targetFile.mkdirs();
                    if (split[1].equals("txt")) parser.newInstance(
                            fl,
                            new FileOutputStream(new File(targetFile, split[0] + ".js")));
                    else new FileCopier(fl, new File(targetFile, fl.getName()));
                }
            }
            //await children to see if they make any files
            for (Thread thread : childFolders) {
                thread.join();
            }
        } catch (IOException | IllegalAccessException | InstantiationException | InvocationTargetException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
